    const
        express = require('express'),
        app = express(),
        port = 3000,
        mongoose = require("mongoose"),
        methodOverride = require('method-override'),
        bodyParser = require("body-parser");
    //IMAGE------------------------------------------------------
    const
        multer = require('multer'),
        path = require('path');
    app.use(express.static(__dirname + "/public"));

    //ajout image--------------------------------------------
    const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                console.log(file);
                cb(null, './public/uploads')
            },
            filename: (req, file, cb) => {
                cb(null, Date.now() + '_' + file.originalname)
            },
        }),
        //filtre image-----------
        upload = multer({
            storage: storage,
            /*limits: {
                fileSize: 1
            },*/
            fileFilter: (req, file, cb) => {
                if (
                    file.mimetype === 'image/png' ||
                    file.mimetype === 'image/jpeg' ||
                    file.mimetype === 'image/jpg' ||
                    file.mimetype === 'image/svg+xml' ||
                    file.mimetype === 'image/svg' ||
                    file.mimetype === 'image/gif'
                ) {
                    cb(null, true)
                } else cb(new Error('le fichier doit être au format png,jpeg,jpg,gif.'))
            }
        });
    //VIEWS------------------------------------------------------
    const
        exphbs = require("express-handlebars"),
        Handlebars = require("handlebars"),
        {
            allowInsecurePrototypeAccess
        } = require('@handlebars/allow-prototype-access');
    //const productSchema = require('./models/productmodel');
    // Handlebars------
    app.engine('hbs', exphbs({
        defaultLayout: 'main',
        extname: 'hbs',
        handlebars: allowInsecurePrototypeAccess(Handlebars)
    }));
    app.set('view engine', 'hbs')
    // BodyParser------
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    //CONNECT BASE DE DONNEES--------------------------------------------------
    require('./config/db')


    //ROUTES---------------------------------------------------
    app.use(methodOverride("_method"));


    //modele---------------------------------------------------
    const productSchema = {
        modele: String,
        marque: String,
        description: String,
        prix: Number,
        image: {
            name: String,
            originalName: String,
            path: String,
            creatAt: Date
        }
    }
    const product = mongoose.model("product", productSchema);













    //route admin---------------------
    app.route('/admin')
        .get((req, res) => {
            product.find((err, docs) => {
                if (!err) {
                    res.render('admin', {
                        product: docs
                    })
                }
            })
        })

        .post(upload.single('image'), (req, res) => {
            const file = req.file;

            const newProduct = new product({
                modele: req.body.modele,
                marque: req.body.marque,
                description: req.body.description,
                prix: req.body.prix,
            });
            if (file) {
                newProduct.image = {
                    name: file.filename,
                    originalname: file.originalname,
                    path: file.path.replace("public", ""),
                    creatAt: Date.now()
                }
            }
            newProduct.save((err) => {
                if (!err) {
                    res.redirect("/admin")
                } else {
                    res.send(err)
                }
            })
        })










    //OUVRE LE PORT 3000--------------------------------------------
    app.listen(port, function () {
        console.log(`écoute le port ${port}`);

    })