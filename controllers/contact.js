const mailsender = require('../helpers/mailsender');

/**
 * GET /contact
 * Contact form page.
 */
exports.getContact = (req, res) => {
    res.render('contact', {
        title: 'Contact us',
        pagename: 'contact'
  });
};

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 */
exports.postContact = (req, res) => {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('message', 'Message cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/contact');
  }

  mailsender.sendMail(
      process.env.ADMIN_EMAIL,
      `${req.body.name} <${req.body.email}>`,
      'Contact Form | ' + process.env.APP_NAME,
      req.body.message,
      function (err, info) {
          if (err) {
              req.flash('errors', { msg: err.message });
              return res.redirect('/contact');
          }
          req.flash('success', { msg: 'Email was sent successfully!' });
          res.redirect('/contact');
      });
};