/* Lab.Direct site configuration — edit this one file to change payments, contests and contact routing. */
window.LD_CONFIG = {
  siteName: "Lab.Direct",
  siteUrl: "https://lab.direct",
  ownerContactUrl: "https://web.works/contact",
  adsenseClient: "ca-pub-6620975821265271",

  /* Owner inbox, stored as reversed, offset character codes so it never appears in page source.
     Assembled only at submit time or when a visitor clicks an "Email us" link. */
  _k: [116, 118, 106, 53, 115, 112, 104, 116, 110, 71, 56, 104, 122, 114, 121, 118, 126, 105, 108, 126],
  _o: 7,

  /* Optional: after activating FormSubmit, replace the inbox with the random alias FormSubmit gives you,
     e.g. formAlias: "a1b2c3d4e5f6...". Leave empty to use the inbox above. */
  formAlias: "",

  /* Donation and payment links. Leave a value empty and its button opens the pledge form instead. */
  payments: {
    paypal: "",          // e.g. https://www.paypal.com/donate/?hosted_button_id=XXXX or https://paypal.me/yourname
    stripe: "",          // e.g. https://donate.stripe.com/xxxx
    buymeacoffee: "",    // e.g. https://buymeacoffee.com/yourname
    githubSponsors: ""   // e.g. https://github.com/sponsors/yourname
  },

  /* Fundraising meter on the Support page */
  fund: { goal: 25000, raised: 0, supporters: 0, currency: "USD" },

  /* Affiliate links by provider key. Add tracked links as programs approve the site; they render with rel="sponsored". */
  affiliates: {}
};
