// Facts shown on the site. Taken from the current website (faq.html, privacy.html).
export const site = {
  name: "Salem Tamil Roots",
  phone: "+91 96777 57237",
  phoneHref: "tel:+919677757237",
  whatsapp: "https://wa.me/919677757237",
  email: "customercare@salemtamilroots.in",
};

/*
  Pages that still live in the current frontend (salemtamilroots_frontend).
  On UAT and production nginx sends these paths to the old site until each page
  is rebuilt here, so plain links keep working during the switch-over.
*/
export const legacy = {
  shop: "/products_listing.html",
  cart: "/viewcart.html",
  signin: "/signin.html",
  about: "/about.html",
  faq: "/faq.html",
  shipping: "/shippingPolicy.html",
  returns: "/ReturnRefundPolicy.html",
  privacy: "/privacy.html",
  terms: "/terms.html",
  sell: "/SellerSignUp.html",
  category: (id: number | string) => `/products_listing.html?categoryId=${id}`,
};
