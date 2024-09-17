var express = require("express");
var router = express.Router();
const customerModel = require("../models/customer.model");
const multer = require("multer");
const { body, validationResult } = require("express-validator");

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}.jpg`);
  },
});

const upload = multer({ storage: diskStorage });

/* GET home page. */
router.get("/", async (req, res) => {
  const customers = await customerModel.find();
  res.render("customer/index", { title: "Customer List", customers });
});

router.get("/search", async (req, res) => {
  const customers = await customerModel.find({
    email: new RegExp(req.query.keyword),
  });
  res.render("customer/index", { title: "Customer List", customers });
});

router.get("/create", (req, res) => {
  res.render("customer/create", { title: "Create Customer" });
});

router.post(
  "/create",
  [
    upload.single("image"),
    body("fullname").notEmpty().withMessage("Please input Fullname"),
    body("email")
      .notEmpty()
      .withMessage("Please input Email")
      .isEmail()
      .withMessage("Email form is wrong!")
      .custom(async (value) => {
        const existed = await customerModel.findOne({ email: value });
        if (existed) {
          throw new Error("Email is existed. Please input other email!.");
        }
      }),
    body("password").notEmpty().withMessage("Please input Password"),
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.render("customer/create", {
        title: "Create Customer",
        errors: errors.array(),
      });
    }

    let cust = new customerModel(req.body);
    cust.image = req.file.filename;
    await cust.save();
    res.redirect("/customer");
  }
);

//delete
router.get("/delete/:id", async (req, res) => {
  await customerModel.findByIdAndDelete(req.params.id);
  res.redirect("/customer");
});

//update
router.get("/update/:id", async (req, res) => {
  let cus = await customerModel.findById(req.params.id);
  res.render("customer/update", {
    title: "Update Customer",
    cus,
    img: cus.image,
  });
});

router.post(
  "/update/:id",
  [
    upload.single("image"),
    body("fullname").notEmpty().withMessage("Please input Fullname"),
    body("email").notEmpty().withMessage("Please input Email"),
    body("password").notEmpty().withMessage("Please input Password"),
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      let c = await customerModel.findById(req.params.id);
      return res.render(`customer/update`, {
        title: "Update Customer",
        e: errors.array(),
        cus: req.body,
        img: c.image,
      });
    }
    const body = req.body;
    const file = req.file;
    let cus = await customerModel.findById(req.params.id);
    cus.fullname = body.fullname;
    cus.password = body.password;
    if (file) {
      cus.image = file.filename;
    }
    try {
      await cus.save();
      res.redirect("/customer");
    } catch (error) {
      res.redirect(`/customer/:id`);
      res.status(500);
    }
  }
);

module.exports = router;
