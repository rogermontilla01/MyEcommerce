var productsModel = require('../models/products.model'); 
var productsCtrl = {};
var multer = require('multer');
var fs = require('fs')
const { eventNames } = require('../models/products.model');
var multerUpload = multer({dest: process.env.IMG_DIR}).single('photo');

productsCtrl.getAll = async function (req, res, next) {
  let productos = await productsModel.paginate(
    {},
    { populate: [{path:'category', select:'name'}, {path:'subcategory', select:'subname'}] , limit: 8, sort: { name: -1 }, page: req.query.page ? req.query.page : 1 }
  );
  console.log(productos);
  res.status(200).json(productos);
};

productsCtrl.getByList = async function (req, res, next){
  //console.log('LIST =>',req.query.list)
  products = await productsModel.find().where('_id').in(req.query.list)
  console.log(products);
  res.status(200).json(products);
}

productsCtrl.getFeatured = async function (req, res, next) {
  let productos = await productsModel.find({ featured: 1 });
  console.log(productos);
  res.status(200).json(productos);
};
productsCtrl.getById = async function (req, res, next) {
  console.log(req.params.id);
  let productos = await productsModel.findById(req.params.id);
  console.log(productos);
  res.status(200).json(productos);
};
productsCtrl.create = async function (req, res, next) {
  let producto = new productsModel({
    name: req.body.name,
    sku: req.body.sku,
    description: req.body.description,
    price: req.body.price,
    offert: req.body.offert,
    quantity: req.body.quantity,
    subcategory: req.body.subcategory,
    featured: req.body.featured,
    images: req.body.images,
  });
  let data = await producto.save();
  res.status(201).json({ stauts: 'ok', data: data });
};
productsCtrl.update = async function (req, res, next) {
  try {
    let data = await productsModel.update({ _id: req.params.id }, req.body, { multi: false });
    deleteImg(req.query.oldImg)
    res.status(201).json({ status: 'ok', data: data });
  } catch (error) {
    res.status(404).json({status:'error', data: error})
    console.log(error)
  }
};

productsCtrl.deleteProduct = async function (req, res, next) {
  
  try {
    let data = await productsModel.findByIdAndDelete({ _id: req.params.id });
    await deleteImg(req.params.img)
    res.status(201).json({ status: 'ok', data: data });
  } catch (error) {
    res.status(401).json({status:'error', data: error})
    console.log(error)
  }
  
};

productsCtrl.uploadImg = async function (req, res, next){
  var path = '';
  multerUpload(req, res, function(err){
    if(err){
      console.log(err);
      next()
    }
    path = req.file.path;
    res.status(201).json({status: 'success', message: 'Img upload successfuly', data: req.file})
  })
}

function deleteImg(oldImg){
  //eliminar imagen vieja  
  fs.unlink('public/images/'+oldImg, function(err){
    if(err){
      console.log(err)
    }
  }) 
}

module.exports = productsCtrl;
