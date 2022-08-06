// Mailing

const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mikedegeofroy',
        pass: 'pvjfzcnqfnhxfixs'
    }
});

var mailOptions = {
    from: 'mike@degeofroy.com',
    to: 'mikejustmikethemike@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!',
    attachments: [
        {
            filename: 'banana.txt',
            path: 'banana.txt'
        },
    ]
};

transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});