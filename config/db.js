const mongoose = require("mongoose");

//CONNEXION A MONGODB--------------------------------------------
mongoose.connect(
    "mongodb://localhost:27017/boutiquesape", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    (err) => {
        if (!err) console.log("MongoDB connect");
        else console.log("connect error:" + err);
    }
);