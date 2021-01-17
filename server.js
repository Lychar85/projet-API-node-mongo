

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
        marques: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "marques"
        },
        description: String,
        prix: Number,
        image: {
            name: String,
            originalName: String,
            path: String,
            creatAt: Date
        },
    }
    const marquesModel = {
        type: String
    };

    const product = mongoose.model("product", productSchema);
    const marques = mongoose.model("marques", marquesModel);
    

    //route admin---------------------
    app.route("/admin")
    .get((req, res) => {
        product
            .find()
            .populate("marques")
            .exec((err, docs) => {
                if (!err) {

                    marques.find((err, cat) => {
                        res.render('admin', {
                            product: docs,
                            marques: cat
                        })
                    })


                } else {
                    res.send('err')
                }
            })
    })



        .post(upload.single('image'), (req, res) => {
            const file = req.file;

            const newProduct = new product({
                modele: req.body.modele,
                description: req.body.description,
                prix: req.body.prix,
                marques: req.body.marques
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
        });

// route marques--------------------------------------------
app.route("/marques")
    .get((req, res) => {


        marques.find((err, cat) => {
            if (!err) {
                res.render('marques', {
                    marques: cat
                })
            } else {
                res.send('err')
            }
        })
    })

    .post((req, res) => {
        const newMarques = new marques({
            type: req.body.type
        })
        newMarques.save((err) => {
            if (!err) {
                res.redirect("/marques")
            } else res.send(err)
        });
    });

//route ID--------------------------------------------
app.route('/:id')
    .get((req, res) => {
        product.findOne({
            _id: req.params.id
        }, (err, docs) => {
            if (!err) {
                marques.find((err, cat) => {
                    res.render('edition', {
                        _id: docs.id,
                        modele: docs.modele,
                        price: docs.price,
                        marques: cat,
                    })
                })

            } else {
                res.send(err)
            }
        })
    })

    //METTRE A JOUR-------- 
    .put((req, res) => {
        product.updateOne(
            {
                _id: req.params.id
            },
            {
                modele: req.body.modele,
                price: req.body.price,
                marques: req.body.marques,
            },
            {
                multi: true
            },
            (err) => {
                if (!err) {
                    res.redirect('/admin')
                } else {
                    res.send(err)
                }
            }
        )
    })

    .delete((req, res) => {
        product.deleteOne({
            _id: req.params.id
        }, (err, ) => {
            if (!err) {
                res.redirect('/admin')

            } else {
                res.send(err)
            }
        })
    });

        //route admin---------------------
        app.route("/")
        .get((req, res) => {
            product
                .find()
                .populate("marques")
                .exec((err, docs) => {
                    if (!err) {
    
                        marques.find((err, cat) => {
                            res.render('index', {
                                product: docs,
                                marques: cat
                            })
                        })
    
    
                    } else {
                        res.send('err')
                    }
                })
        })
    

    //OUVRE LE PORT 3000--------------------------------------------
    app.listen(port, function () {
        console.log(`écoute le port ${port}`);

    })

    