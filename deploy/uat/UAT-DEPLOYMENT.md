# Deploying the new site and the new API to UAT

This puts the new storefront (`salemtamilroots_web`) and the new API (`salemtamilroots_web_backend`) on
**uat.salemtamilroots.in**, replacing the old API there. Production is not touched.

Time: about 45 minutes the first time. Later updates are steps 6 and 7 only (about 5 minutes).

## Before you start

- **What changes for UAT testers:** sign-in, checkout, payment and "My account" move to the new site.
  The old (legacy) pages on UAT will stop working properly against the new API (agreed: only the new
  site matters on UAT). The switch button between old and new stays.
- **The database is not changed.** The new API reads and writes the same UAT database, with the same
  tables. No migrations, nothing to back up beyond what you normally do.
- **Rollback takes one minute** (see the end): the old API stays installed, just stopped.
- **Branch:** deploy `main` of both repos (the work is merged).
- **You need:** SSH to the VPS as a user with `sudo`, and access to the MSG91 and Cashfree dashboards.
- **Never paste passwords or keys into chat or tickets.** They go only into the files named below.

Commands below are run on the VPS. Lines starting with `sudo` need root.

---

## Step 1. Check the current UAT setup (read only)

```bash
systemctl cat uat_strroots | grep -E "WorkingDirectory|ExecStart|ASPNETCORE"
```

Expected: `WorkingDirectory=/opt/uat/salemtamilroots_backend/SalemTamilRoots` and
`ASPNETCORE_URLS=http://0.0.0.0:5001`. If the folder is different, use that folder wherever this guide
says `/opt/uat/salemtamilroots_backend/SalemTamilRoots` (also in `deploy-api.sh`, variable `WWWROOT`).

```bash
dotnet --list-sdks          # needs an 8.0.x SDK
node --version              # needs 20.9 or newer
ls /opt/uat/salemtamilroots_backend/SalemTamilRoots/wwwroot/assets   # images, Invoice, ...
```

## Step 2. Install the new API beside the old one

```bash
sudo mkdir -p /opt/uat/salemtamilroots_web_backend/{config,releases}
sudo git clone https://github.com/inaivuIT-Git/salemtamilroots_web_backend.git /opt/uat/salemtamilroots_web_backend/src
```

(If GitHub asks for credentials, use the same deploy key or token the other UAT checkouts use.)

**Settings file.** Start from the old UAT API's live settings, so the database, JWT key, Cashfree, MSG91
and email settings stay exactly as they are:

```bash
sudo cp /opt/uat/salemtamilroots_backend/SalemTamilRoots/appsettings.json /opt/uat/salemtamilroots_web_backend/config/appsettings.json
sudo nano /opt/uat/salemtamilroots_web_backend/config/appsettings.json
```

In that file, check or change only these:

| Setting | What to do |
|---|---|
| `Jwt` → `DurationMin` (or `DurationMinutes`) | Set to `480` (8-hour sign-ins). The old API ignored this name and always used 60. |
| `Cashfree` → `Environment` | Must be `SANDBOX` on UAT. |
| `Cashfree` → `ClientId`, `ClientSecret` | Sandbox credentials (already there if UAT payments worked before). |
| `MSG91` → `AuthKey` | Already there if OTP login worked on UAT before. |
| `ConnectionStrings` → `DefaultConnection` | The UAT database (`uat_salemtamilroots`), unchanged. |

Then lock it down: only root and the service account may read it.

```bash
sudo chown root:www-data /opt/uat/salemtamilroots_web_backend/config/appsettings.json
sudo chmod 640 /opt/uat/salemtamilroots_web_backend/config/appsettings.json
```

**Images and invoices.** The new API uses the old one's `wwwroot` (the deploy script links it), so
nginx keeps serving product images from the same place. The service account must be able to write there
(new uploads and invoice PDFs):

```bash
sudo chown -R www-data:www-data /opt/uat/salemtamilroots_backend/SalemTamilRoots/wwwroot
```

**Service file:**

```bash
sudo cp /opt/uat/salemtamilroots_web_backend/src/deploy/uat/salemtamilroots-api-uat.service /etc/systemd/system/
sudo systemctl daemon-reload
```

## Step 3. Switch port 5001 from the old API to the new one

The old and new APIs both use port 5001 and both run background jobs (reminder emails, seller payouts),
so only one may run at a time. Stop and disable the old one first (it stays installed for rollback):

```bash
sudo systemctl stop uat_strroots
sudo systemctl disable uat_strroots
sudo systemctl enable salemtamilroots-api-uat
sudo bash /opt/uat/salemtamilroots_web_backend/src/deploy/uat/deploy-api.sh main
```

The script builds, starts the API and checks it. It should end with `API <commit> is up on
127.0.0.1:5001`. If the check fails it prints the last log lines; see "If something goes wrong" below.

## Step 4. nginx: send the new pages to the new site

The repo's UAT nginx file now also sends `/signin`, `/checkout`, `/account`, `/account/...`,
`/orders/...` and the admin area (`/admin`, `/admin/...`, orders and products) to the new site. Compare it with the live one, then install it:

```bash
cd /opt/uat/salemtamilroots_web && sudo git fetch origin main
sudo git show origin/main:deploy/uat/nginx-uat.salemtamilroots.in.conf > /tmp/uat-nginx.conf
diff /etc/nginx/sites-enabled/uat.salemtamilroots.in /tmp/uat-nginx.conf
```

The differences should be only the new `location` lines for those pages. If the live file has other
changes of its own (certificates, extra locations), add just the new lines to it instead of replacing it.

```bash
sudo cp /etc/nginx/sites-enabled/uat.salemtamilroots.in /root/uat.salemtamilroots.in.before-new-api
sudo cp /tmp/uat-nginx.conf /etc/nginx/sites-enabled/uat.salemtamilroots.in
sudo nginx -t && sudo systemctl reload nginx
```

## Step 5. Settings for the new site

Sign-in uses the MSG91 OTP widget. Its widget id and token are the same values as `MSG91_CONFIG` in the
current frontend (`salemtamilroots_frontend/assets/js/common/config.js`, keys `widgetId` and
`tokenAuth`). Add them to the new site's settings file:

```bash
sudo nano /opt/uat/salemtamilroots_web/.env.production.local
```

Add (values from that config.js, without quotes):

```
NEXT_PUBLIC_MSG91_WIDGET_ID=...
NEXT_PUBLIC_MSG91_TOKEN_AUTH=...
```

Keep the existing lines (`API_BASE_URL`, `API_INTERNAL_URL=http://127.0.0.1:5001`, `USE_SAMPLE_DATA=0`,
...). The two values are read when the site is built, so rebuild after any change (step 6).

## Step 6. Deploy the new site

```bash
sudo bash /opt/uat/salemtamilroots_web/deploy/uat/deploy.sh main
```

It installs packages (Next.js 16.4.6, with the security fixes), builds and restarts the site, and should
end with `new site on localhost:3102 -> HTTP 200`.

## Step 7. Check it works

Open **https://uat.salemtamilroots.in/switch-ui/modern** on your phone and laptop (this selects the new
site), then:

1. **Sign in:** account icon → enter a mobile number → OTP by SMS → you return signed in.
   If it says "We could not confirm which mobile number was verified", see below.
2. **Cart and checkout:** add two products → Cart → Checkout → add an address → pick
   **Cash on delivery** → Place order → "Thank you! Your order is confirmed."
3. **Online payment (sandbox):** another order → **Pay online** → Cashfree's sandbox page → pay with a
   [Cashfree test card or UPI](https://www.cashfree.com/docs/payments/online/resources/sandbox-environment)
   → you come back and see "Your payment was received."
4. **Closed tab:** one more online order, pay, and **close the tab on Cashfree's success page before it
   returns**. Open My account → the order should still show as Confirmed (Cashfree's webhook did it).
   This needs the webhook in Cashfree's sandbox dashboard (Developers → Webhooks) to point at
   `https://uat.salemtamilroots.in/api/Cashfree/webhook`.
5. **My account:** the orders are listed; open one, cancel it with a reason; check stock in the admin
   pages went back up for the cancelled cash-on-delivery order.
6. **Wishlist and reviews:** tap a heart on a product → My account → Wishlist. For a review, an order
   item must be delivered: mark one delivered in the admin pages, then "Write a review" under it.
7. **Tamil:** switch to தமிழ் and repeat a few pages; nothing should scroll sideways on a phone.
8. **Admin orders:** open `https://uat.salemtamilroots.in/admin` and sign in with an admin account's email
   (or phone) and password, as on the old admin page. Find the test orders under "To ship", move one
   through the next steps to "Shipment assigned" (choose the courier, enter a tracking number) and on to
   "Delivered", then use "Email the invoice to the customer". Mark an online test order paid, and
   cancel another: its stock goes back.
9. **Admin products and stock:** in the admin area open **Products**. Search for a product, open it and:
   type a new base price (the new MRP shows before you save) and save; add a 10% discount and check the
   shop shows the lower price; under Stock use "Stock arrived" with a batch code, then "Correct the
   count"; upload a main picture (JPG, PNG or WebP) and remove an extra one; hide the product and check
   it's gone from the shop, then show it again. Use a test product, or put real values back afterwards.
10. **New product and its words:** Products → **+ New product**. Enter an English name (letters,
    numbers and spaces; it becomes the web address), seller, category, the first size, base price and
    stock → Create. It starts hidden. Open **Words and story**: add the Tamil title, a short description
    with some bold text, and two story sections (one as a list) → Save. Back on the product, **+ Add a
    size** (its words are copied), add a picture to each size, then **Show in shop** on both. Open the
    shop page in English and in தமிழ் and check the words and both sizes appear.

Useful while testing:

```bash
journalctl -u salemtamilroots-api-uat -f      # API log
journalctl -u salemtamilroots-web-uat -f      # site log
```

## Updating later

After new commits are merged into `main`:

```bash
sudo bash /opt/uat/salemtamilroots_web_backend/src/deploy/uat/deploy-api.sh main
sudo bash /opt/uat/salemtamilroots_web/deploy/uat/deploy.sh main
```

The API script keeps the last five builds and switches back automatically if the new one doesn't
start.

---

## If something goes wrong

**The API health check fails.** Read the log lines the script prints. Common causes:

| Log says | Fix |
|---|---|
| `password authentication failed` or `could not connect` | Connection string in `config/appsettings.json`. |
| A message about the JWT key or its size | `Jwt:Key` must be the old file's key (at least 32 characters). |
| `Permission denied` on `appsettings.json` | Step 2, the `chown`/`chmod` lines. |
| `address already in use` | The old API is still running: `sudo systemctl stop uat_strroots`. |

**OTP sign-in says "We could not confirm which mobile number was verified".** The API asks MSG91 which
number the OTP was for and couldn't read it from MSG91's answer. Run
`journalctl -u salemtamilroots-api-uat | grep -i msg91 | tail` and send the lines **with any keys
removed**, and it can be adjusted.

**"OTP sign-in isn't set up on this server yet".** The two `NEXT_PUBLIC_MSG91_...` lines are missing;
step 5, then step 6 again.

**Payment page doesn't open ("We couldn't open the payment page").** Cashfree settings in
`config/appsettings.json` (sandbox id and secret, `Environment` = `SANDBOX`). The API log shows
Cashfree's reply.

**New pages show the old site.** nginx (step 4) wasn't reloaded, or your browser is on the legacy
design: open `/switch-ui/modern` again.

## Rollback (back to the old API)

```bash
sudo systemctl stop salemtamilroots-api-uat
sudo systemctl disable salemtamilroots-api-uat
sudo systemctl enable --now uat_strroots
sudo cp /root/uat.salemtamilroots.in.before-new-api /etc/nginx/sites-enabled/uat.salemtamilroots.in
sudo nginx -t && sudo systemctl reload nginx
```

Orders placed through the new site stay in the database and are visible to the old API and admin
pages. To go forward again, repeat step 3 from `sudo systemctl stop uat_strroots`.
