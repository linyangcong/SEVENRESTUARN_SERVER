var express = require('express');
var router = express.Router();
var {queryProduct,queryOperation,updateProduct,insertProduct}=require('../DB/adus')
var formidable = require('formidable');
const fs=require('fs')
var {staticServer}=require('../config')
/*后台服务 */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/getProduct',async (req,res,next)=>{
  
  let result_business=await queryProduct('business','business_name',"普宁市洪兴果汁面")
  // console.log(result_business[0])
  let result_type=await queryProduct('menu_type','fk_type',result_business[0].Id)
  let result_type_arr=[]
console.log(req.query)
  for(let i=0;i<result_type.length;i++){
    let result_type_list=result_type[i]
    result_type_list.result_list_arr=await queryProduct('menu_list','fk_list',result_type_list.Id)
    for(let j=0;j<result_type_list.result_list_arr.length;j++){
      for(let o=0;o<result_type_list.result_list_arr.length;o++){
        let sizeobj=await queryProduct('menu_size','fk_size',result_type_list.result_list_arr[j].Id)
        let sizearr=[]
        // if(sizeobj[0].s=='1'){sizeobj[0].s=true}
        if(req.query.flag=='sizearr'){
          sizearr.push(sizeobj[0].s=='1'?'s':'');
          sizearr.push(sizeobj[0].m=='1'?'m':'');
          sizearr.push(sizeobj[0].l=='1'?'l':'')
          result_type_list.result_list_arr[j].size_type=sizearr
        }else{
          sizeobj[0].s=(sizeobj[0].s=='1');sizeobj[0].m=(sizeobj[0].m=='1');sizeobj[0].l=(sizeobj[0].l=='1')
          result_type_list.result_list_arr[j].size_type=sizeobj[0]
        }
      }
      // console.log(result_list_arr[j])
      result_type_list.result_list_arr[j].price_type=(await queryProduct('menu_price','fk_price',result_type_list.result_list_arr[j].Id))[0]
      // result_price.push(await queryProduct('menu_price','fk_price',result_list_arr[j].Id))
    }
    result_type_arr.push(result_type_list)
  }

  businessObj={
    business:result_business[0],
    result_type:result_type_arr
  }


  res.send(businessObj)
})

router.post('/uploadFile',function(req,res,next){
  var form = new formidable.IncomingForm();
  console.log(req.query)
  let foldId=req.query.menu_Id
  // let ramdom='create'+(Math.random()*100).toFixed(0)
  let fildId=''
   form.parse(req, async (error, fields, files)=>{
    // 读取文件流并写入到public/test.png
    // E:\xampp\htdocs\sevenRestuarant\menu_lists
    if(req.query.Id!=='undefined'){
      // 修改菜单图片
      fildId=req.query.Id
    }else{
      //新建的菜单
      fildId=(await queryOperation('menu_list','maxId'))[0].Id+1
    }
      fs.exists(staticServer+'/menu_lists/'+foldId,async (exists)=>{
      if(exists){
        console.log('目录已经存在，不需要新建')
        fs.writeFileSync(staticServer+'/menu_lists/'+foldId+'/l'+fildId+'.jpg', fs.readFileSync(files.upload.path));
      }else{
       await fs.mkdirSync(staticServer+'/menu_lists/'+foldId)
       await fs.writeFileSync(staticServer+'/menu_lists/'+foldId+'/l'+fildId+'.jpg', fs.readFileSync(files.upload.path));
      }
    })
    await updateProduct('menu_list','menu_img',`'/sevenRestuarant/menu_lists/${foldId}/l${fildId}.jpg'`,'Id',`${fildId}`)
    res.send({url:`/sevenRestuarant/menu_lists/${foldId}/l${fildId}.jpg`}).status(200)
  })

})

router.post('/updateItem',async (req,res,next)=>{
  console.log(req.body)
  console.log('===================1=')
  await updateProduct('menu_list','name',`'${req.body.name}'`,'id',`${req.body.Id}`)
  console.log('===================2=')
  await updateProduct('menu_list','decorations',`'${req.body.decorations}'`,'id',`${req.body.Id}`)
  console.log('==================3==')
  await updateProduct('menu_list','fk_list',`${req.body.menu_type.Id}`,'id',`${req.body.Id}`)
  console.log('=================4===')
  // await updateProduct('menu_list','size_type',`'${req.body.size_type}'`,'id',`'${req.body.Id}'`)
  await updateProduct('menu_size','s',`'${req.body.size_type.s}'`,'fk_size',`${req.body.Id}`)
  console.log('================5====')
  await updateProduct('menu_size','m',`'${req.body.size_type.m}'`,'id',`${req.body.Id}`)
  console.log('================6====')
  await updateProduct('menu_size','l',`'${req.body.size_type.l}'`,'id',`${req.body.Id}`)
  console.log('=================7===')
  if(req.body.price_type.s){
    await updateProduct('menu_price','s',`'${req.body.price_type.s}'`,'fk_price',`${req.body.Id}`)
    await updateProduct('menu_price','old_s',`'${req.body.price_type.old_s}'`,'fk_price',`${req.body.Id}`)
  }
  if(req.body.price_type.m){
    await updateProduct('menu_price','m',`'${req.body.price_type.m}'`,'fk_price',`${req.body.Id}`)
    await updateProduct('menu_price','old_m',`'${req.body.price_type.old_m}'`,'fk_price',`${req.body.Id}`)
  }
  if(req.body.price_type.l){
    await updateProduct('menu_price','l',`'${req.body.price_type.l}'`,'fk_price',`${req.body.Id}`)
    await updateProduct('menu_price','old_l',`'${req.body.price_type.old_l}'`,'fk_price',`${req.body.Id}`)
  }
  console.log('==============8======')
  res.sendStatus(200)
})


router.get('/getShoppingType',async (req,res,next)=>{
  let type=await queryProduct('menu_type')
  res.send({type}).status(200)
})

router.post('/insertItem',async (req,res,next)=>{
  console.log(req.body)
  // insert into menu_list
  // values(14,'菜菜1','/sevenRestuarant/menu_lists/t2/menu24077.jpg','20','东莞的根深蒂固','25',3,'l14','s,m,l')
  let id=(await queryOperation('menu_list','maxId'))[0].Id
  let fk_list=req.body.menu_type.Id
  await insertProduct('menu_list',(id+1),`'${req.body.name}'`,`'${req.body.menu_img}'`,`''`,`'${req.body.decorations}'`,`''`,`${fk_list}`,`'l${id+1}'`)
  let menu_price_id=(await queryOperation('menu_price','maxId'))[0].Id
  await insertProduct('menu_price',(menu_price_id+1),`'${req.body.price_type.s}'`,`'${req.body.price_type.m}'`,`'${req.body.price_type.l}'`,`'${req.body.price_type.old_s}'`,`'${req.body.price_type.old_m}'`,`${req.body.price_type.old_l}`,`${(id+1)}`)
  let menu_size_id=(await queryOperation('menu_size','maxId'))[0].Id
  await insertProduct('menu_size',(menu_size_id+1),`'${req.body.size_type.s}'`,`'${req.body.size_type.m}'`,`'${req.body.size_type.l}'`,`${(id+1)}`)
  res.send({status:'success'}).status(200)


})

router.post('/newType',async (req,res,next)=>{
console.log(req.body)
let typeId=(await queryOperation('menu_type','maxId'))[0].Id
console.log(typeId)
await insertProduct('menu_type',(typeId+1),`'${req.body.newType_name}'`,`${req.body.newType_fk_type}`,`'t${(typeId+1)}'`)
res.send({status:'ok'}).status(200)
})

router.post('/addAddress',async (req,res,next)=>{
  console.log(req.body)
  let location=''
  if(req.body.location.lat!=undefined&&req.body.location.long!=undefined){
    location=req.body.location.lat+','+req.body.location.long
  }
  let userId=(await queryOperation('base_user','maxId'))[0].Id
  await insertProduct('base_user',(userId+1),`'${req.body.name}'`,`''`,`''`,`''`,`''`,`''`,'01',`'${req.body.mobile}'`,`'${req.body.address}'`,`'${location}'`,`'u${userId+1}'`)
  res.send({status:'ok'}).status(200)
})
router.get('/getUserList',async (req,res,next)=>{
  let userlist=await queryProduct('base_user')
  console.log('==========')
  console.log(userlist)
  res.send({userlist}).status(200)
})







// 移动端服务




module.exports = router;
