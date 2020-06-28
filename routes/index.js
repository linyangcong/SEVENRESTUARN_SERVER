var express = require('express');
var sha1=require('sha1')
var router = express.Router();
var {queryProduct,queryOperation,updateProduct,insertProduct,deleteProduct}=require('../DB/adus')
var formidable = require('formidable');
var axios =require('axios')
const fs=require('fs')
var {staticServer}=require('../config');
const { FORMERR } = require('dns');
/*后台服务 */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/getProduct',async (req,res,next)=>{
  let result_business=[]
  let result_type=[]
  if(req.query.businessId==undefined){
    result_business=await queryProduct('business',false)
    result_type=await queryProduct('menu_type',false)
  }else{
    result_business=await queryProduct('business',true,'Id',req.query.businessId)
    result_type=await queryProduct('menu_type',true,'fk_type',req.query.businessId)
  }

  let result_type_arr=[]
// console.log(req.query)
  for(let i=0;i<result_type.length;i++){
    let result_type_list=result_type[i]
    result_type_list.result_list_arr=await queryProduct('menu_list',true,'fk_list',result_type_list.Id)
    for(let j=0;j<result_type_list.result_list_arr.length;j++){
      for(let o=0;o<result_type_list.result_list_arr.length;o++){
        let sizeobj=await queryProduct('menu_size',true,'fk_size',result_type_list.result_list_arr[j].Id)
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
      result_type_list.result_list_arr[j].price_type=(await queryProduct('menu_price',true,'fk_price',result_type_list.result_list_arr[j].Id))[0]
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
  let form = new formidable.IncomingForm();
  // console.log(req.query)
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
        // console.log('目录已经存在，不需要新建')
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
  // console.log(req.body)
  await updateProduct('menu_list','name',`'${req.body.name}'`,'id',`${req.body.Id}`)
  await updateProduct('menu_list','decorations',`'${req.body.decorations}'`,'id',`${req.body.Id}`)
  await updateProduct('menu_list','fk_list',`${req.body.menu_type.Id}`,'id',`${req.body.Id}`)
  // await updateProduct('menu_list','size_type',`'${req.body.size_type}'`,'id',`'${req.body.Id}'`)
  await updateProduct('menu_size','s',`'${req.body.size_type.s}'`,'fk_size',`${req.body.Id}`)
  await updateProduct('menu_size','m',`'${req.body.size_type.m}'`,'id',`${req.body.Id}`)
  await updateProduct('menu_size','l',`'${req.body.size_type.l}'`,'id',`${req.body.Id}`)
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
  res.sendStatus(200)
})


router.get('/getShoppingType',async (req,res,next)=>{
  // console.log(req.query)
  let type=await queryProduct('menu_type',true,'fk_type',req.query.businessId)
  res.send({type}).status(200)
})

router.post('/insertItem',async (req,res,next)=>{
  // console.log(req.body)
  // insert into menu_list
  // values(14,'菜菜1','/sevenRestuarant/menu_lists/t2/menu24077.jpg','20','东莞的根深蒂固','25',3,'l14','s,m,l')
  let dt=new Date()
let createDate= dt.getFullYear()+"-"+(dt.getMonth()+1)+"-"+dt.getDate()+" "+dt.getHours()+":"+dt.getMinutes()+":"+dt.getSeconds()
  let id=(await queryOperation('menu_list','maxId'))[0].Id
  let fk_list=req.body.menu_type.Id
  await insertProduct('menu_list',(id+1),`'${req.body.name}'`,`'${req.body.menu_img}'`,`''`,`'${req.body.decorations}'`,`''`,`${fk_list}`,`'l${id+1}'`,`'${createDate}'`)
  let menu_price_id=(await queryOperation('menu_price','maxId'))[0].Id
  await insertProduct('menu_price',(menu_price_id+1),`'${req.body.price_type.s}'`,`'${req.body.price_type.m}'`,`'${req.body.price_type.l}'`,`'${req.body.price_type.old_s}'`,`'${req.body.price_type.old_m}'`,`${req.body.price_type.old_l}`,`${(id+1)}`)
  let menu_size_id=(await queryOperation('menu_size','maxId'))[0].Id
  await insertProduct('menu_size',(menu_size_id+1),`'${req.body.size_type.s}'`,`'${req.body.size_type.m}'`,`'${req.body.size_type.l}'`,`${(id+1)}`)
  res.send({status:'success'}).status(200)


})

router.post('/newType',async (req,res,next)=>{
  let dt=new Date()
  let createDate= dt.getFullYear()+"-"+(dt.getMonth()+1)+"-"+dt.getDate()+" "+dt.getHours()+":"+dt.getMinutes()+":"+dt.getSeconds()
let typeId=(await queryOperation('menu_type','maxId'))[0].Id
await insertProduct('menu_type',(typeId+1),`'${req.body.newType_name}'`,`${req.body.newType_fk_type}`,`'t${(typeId+1)}'`,`'${createDate}'`)
res.send({status:'ok'}).status(200)
})

router.post('/addAddress',async (req,res,next)=>{
  console.log(req.body)
  let location=''
  let dt=new Date()
  let createDate= dt.getFullYear()+"-"+(dt.getMonth()+1)+"-"+dt.getDate()+" "+dt.getHours()+":"+dt.getMinutes()+":"+dt.getSeconds()
  if(req.body.location.lat!=undefined&&req.body.location.long!=undefined){
    location=req.body.location.lat+','+req.body.location.long
  }
  if(req.body.editflag){
    await deleteProduct('base_user','Id',req.body.Id)
  }
  let userId=(await queryOperation('base_user','maxId'))[0].Id
  await insertProduct('base_user',(userId+1),`'${req.body.name}'`,`''`,`''`,`''`,`''`,`''`,`'01'`,`'${req.body.mobile}'`,`'${req.body.address}'`,`'${location}'`,`'u${userId+1}'`,`'/sevenRestuarant/user/user.png'`,`'${createDate}'`,`'${req.body.fk_b}'`)
  await updateProduct('userlogin','def_address',(userId+1),'Id',req.body.fk_b)
  res.send({status:'ok'}).status(200)
  
})
router.get('/getUserList',async (req,res,next)=>{
  let userlist=await queryProduct('base_user',true,'fk_b',req.query.userId)
  res.send({userlist}).status(200)
})

// 提交订单
router.post('/postOrder',async (req,res,next)=>{
  // console.log(req.body)
let dt=new Date()
let createDate= dt.getFullYear()+"-"+(dt.getMonth()+1)+"-"+dt.getDate()+" "+dt.getHours()+":"+dt.getMinutes()+":"+dt.getSeconds()
// orderId暂时无法获取，到时候获取小程序支付的订单Id
  for(let i=0;i<req.body.shopping.length;i++){
    // let WXorderId=(Math.random()*10000000).toFixed(0)
    let orderId=(await queryOperation('order_detail','maxId'))[0].Id
    await insertProduct('order_detail',(orderId+1),req.body.business.Id,`'${req.body.shopping[i].goodsId}'`,req.body.user.def_address.Id,req.body.shopping[i].detail.Id,`'${req.body.shopping[i].num}'`,`'${createDate}'`,null,null,'2',`'${req.body.shopping[i].size}'`,`'${req.body.shopping[i].price[req.body.shopping[i].size]}'`,`'o${orderId+1}'`)
  }
  
  res.send({status:'ok'}).status(200)
})
// 1592886599659
// 查询订单列表
router.get('/getOrderList',async (req,res,next)=>{
  // console.log(req.query.userId)
  let results=await queryProduct('order_detail',true,'userId',req.query.userId)
   for(let i=0;i<results.length;i++){
      results[i].menuItem= await queryProduct('menu_list',true,'Id',results[i].menu_listId)
      results[i].business= await queryProduct('business',true,'Id',results[i].businessId)
    }


  // let userId=(await queryProduct('base_user',true,'fk_b',req.query.userId))
  // let result=[]
  // for(let j=0;j<userId.length;j++){
  //   let results=await queryProduct('order_detail',true,'userId',userId[j].Id)
  //   for(let i=0;i<results.length;i++){
  //     results[i].menuItem= await queryProduct('menu_list',true,'Id',results[i].menu_listId)
  //     results[i].business= await queryProduct('business',true,'Id',results[i].businessId)
  //   }
  //   result.push(...results)
  // }

  res.send({orderList:results}).status(200)

})
// 获取评论物品
router.get('/getCommentItem',async (req,res,next)=>{
  // console.log(req.query.orderId)
  // let results=await queryProduct('order_detail',false)
  let results=(await queryProduct('order_detail',true,'orderId',`${req.query.orderId}`))[0]
  results.menu=(await queryProduct('menu_list',true,'Id',`${results.menu_listId}`))[0]
  results.business=(await queryProduct('business',true,'Id',`${results.businessId}`))[0]
  // let results=await queryProduct('order_detail',true,'orderId',`${req.query.orderId}`)
  res.send({results}).status(200)
})

// 提交评论
router.post('/postComment',async (req,res,next)=>{
  // console.log(req.body)//
  let item=req.body
  let comres=await queryProduct('comment',true,'orderId',item.orderId)
  if(comres.length==0){
    let dt=new Date()
    let createDate= dt.getFullYear()+"-"+(dt.getMonth()+1)+"-"+dt.getDate()+" "+dt.getHours()+":"+dt.getMinutes()+":"+dt.getSeconds()
      
      await insertProduct('comment',item.Id,`'${item.businessId}'`,`'${item.typeId}'`,`'${item.menuId}'`,`'${item.orderId}'`,`'${item.userId}'`,`'${item.context}'`,`'${item.imgUrl}'`,`'${createDate}'`,`'${item.servernum}'`,`'${item.tastynum}'`,`'${item.packnum}'`,`'${item.distributionnum}'`)
      await updateProduct('order_detail','status','6','Id',`'${item.orderId}'`)
      res.sendStatus(200)
  }else{
    res.sendStatus(500)
  }

})

router.post('/uploadCommentImg',async (req,res,next)=>{
  let form = new formidable.IncomingForm();
  let filedId=(await queryOperation('comment','maxId'))[0].Id+1
   //console.log(filedId)
   form.parse(req, async (error, fields, files)=>{

      fs.exists(staticServer+'/comment/comment_'+filedId+'.jpg',async (exists)=>{
      if(exists){
        fs.exists(staticServer+'/comment/comment_'+filedId+'_a.jpg',async (e)=>{
          if(e){
            await fs.writeFileSync(staticServer+'/comment/comment_'+filedId+'_b.jpg', fs.readFileSync(files.upload.path));
            res.send({url:'/sevenRestuarant/comment/comment_'+filedId+'_b.jpg',Id:filedId}).status(200)
          }else{
            await fs.writeFileSync(staticServer+'/comment/comment_'+filedId+'_a.jpg', fs.readFileSync(files.upload.path));
            res.send({url:'/sevenRestuarant/comment/comment_'+filedId+'_a.jpg',Id:filedId}).status(200)
          }
        
        })
        
      }else{
        await fs.writeFileSync(staticServer+'/comment/comment_'+filedId+'.jpg', fs.readFileSync(files.upload.path));
        res.send({url:'/sevenRestuarant/comment/comment_'+filedId+'.jpg',Id:filedId}).status(200)
      }
    })
    
    // await updateProduct('menu_list','menu_img',`'/sevenRestuarant/comment/${foldId}/l${fildId}.jpg'`,'Id',`${fildId}`)
    
  })

})

// 获取订单评价列表
router.get('/getCommentList',async (req,res,next)=>{
  let result=await queryProduct('comment',true,'businessId',req.query.businessId)
  for(let i=0;i<result.length;i++){
    result[i].user=(await queryProduct('base_user',true,'Id',result[i].userId))[0]
    result[i].business=(await queryProduct('business',true,'Id',result[i].businessId))[0]
    result[i].menu=(await queryProduct('menu_list',true,'Id',result[i].menuId))[0]
    result[i].type=(await queryProduct('menu_type',true,'Id',result[i].TypeId))[0]
    if(result[i].imageUrl!=''){
      result[i].imgeUrl=result[i].imageUrl.split(',')
    }
  }

  
  res.send({result}).status(200)
})

router.get('/confirmOrder',async (req,res,next)=>{
  // console.log(req.query) //{ Id: '10', user: 'T' }
  await updateProduct('order_detail','status','4','Id',req.query.Id)
  res.send({status:'ok'}).status(200)
})




// 注册
router.post('/register',async (req,res,next)=>{
 //  console.log(req.body)
  let result=(await queryProduct('userlogin',true,'loginname',req.body.loginname,'role',req.body.roleId))
  
    if(result.length==0){
      let userId=(await queryOperation('userlogin','maxId'))[0].Id
      if(req.body.wxflag=='01'){
        await insertProduct('userlogin',(userId+1),`'${req.body.username}'`,`'${req.body.loginname}'`,`'${req.body.password}'`,`'${req.body.roleId}'`,0,`''`,`'01'`)
        res.send({message:'login'}).status(200)
      }else if(req.body.wxflag=='02'){
        await insertProduct('userlogin',(userId+1),`'${req.body.username}'`,`'${req.body.loginname}'`,`'${req.body.password}'`,`'${req.body.roleId}'`,0,`''`,`'02'`)
        res.send({message:'wx'}).status(200)
      }
    }else{
      res.sendStatus(500)
    }
   
  
 
})
// 登录
router.post('/login',async (req,res,next)=>{
   //console.log(req.body)
  // 账号密码以及角色查找匹配
  let result=(await queryProduct('userlogin',true,'loginname',req.body.loginname,'password',req.body.password,'role',req.body.roleId))
  if(result.length==0){
     res.sendStatus(404)
  }
  // 查找到相匹配的账号角色
  else{
    // 查找该账号对应的普通用户收货地址信息
    let addr=(await queryProduct('base_user',true,'Id',result[0].def_address))
   
    if(addr.length==0){
      if(result[0].businessId!==null&&result[0].businessId!==''){
        result[0].def_address=(await queryProduct('business',true,'Id',result[0].businessId))[0]
      }else{
        result[0].def_address={phoneNo:'',address:''}
      }
     
    }else{
      result[0].def_address=addr[0]
    }
    
    res.send({result: result[0]}).status(200)
  }
})

// 获取用户角色
router.post('/getRole',async (req,res,next)=>{
 //  console.log(req.body)
  let result=(await queryProduct('userlogin',true,'loginname',req.body.loginname,'password',req.body.password))
  if(result.length==0){
    res.sendStatus(404)
 }else{
   for(let i=0;i<result.length;i++){
    let addr=(await queryProduct('base_user',true,'Id',result[i].def_address))
    if(addr.length==0){

      if(result[i].businessId!==null&&result[i].businessId!==''){
        result[i].def_address=(await queryProduct('business',true,'Id',result[i].businessId))[0]
      }else{
        result[i].def_address={phoneNo:'',address:''}
      }

      // result[i].def_address={phoneNo:'',address:''}
    }else{
      result[i].def_address=addr[0]
    }
   }
   
   res.send({result}).status(200)
 }
})
router.post('/insertbusiness',async (req,res,next)=>{
  // console.log(req.body) 
  // console.log(req.query)
  let businessres=await queryProduct('business',true,'business_name',req.body.shopname)
  // console.log(businessres)
  if(businessres.length==0){
    let dt=new Date()
    let createDate= dt.getFullYear()+"-"+(dt.getMonth()+1)+"-"+dt.getDate()+" "+dt.getHours()+":"+dt.getMinutes()+":"+dt.getSeconds()
    let businessId=(await queryOperation('business','maxId'))[0].Id
    await insertProduct('business',(businessId+1),`'${req.body.shopname}'`,`'${req.body.shopaddress}'`,`'${req.body.shoprphone}'`,`'${createDate}'`,`'${req.body.shopdelfee}'`,`'${req.body.location.lat+','+req.body.location.long}'`,`'${req.body.shopImg}'`,`'${req.body.shopwx}'`,`'${req.body.shoprdelaround}'`,`'${req.body.shopdel}'`,`'${req.body.shopstartfee}'`)
    await updateProduct('userlogin','businessId',`'${(businessId+1)}'`,'Id',req.query.loginid)
    res.sendStatus(200)
  }else{
    res.sendStatus(500)
  }

})

router.get('/getBusiness',async (req,res,next)=>{
 //  console.log(req.query)
  let businessLists=await queryProduct('business',false)
  res.send({businessLists}).status(200)
})

// 上传商家头像
router.post('/businessImg',async (req,res,next)=>{
  let form = new formidable.IncomingForm();
  let filedId=(await queryOperation('business','maxId'))[0].Id+1
  // console.log(filedId)
   form.parse(req, async (error, fields, files)=>{

      fs.exists(staticServer+'/business/business_'+filedId+'.jpg',async (exists)=>{
      if(exists){
        fs.exists(staticServer+'/business/business_'+filedId+'_a.jpg',async (e)=>{
          if(e){
            await fs.writeFileSync(staticServer+'/business/business_'+filedId+'_b.jpg', fs.readFileSync(files.upload.path));
            res.send({url:'/sevenRestuarant//business/business_'+filedId+'_b.jpg',Id:filedId}).status(200)
          }else{
            await fs.writeFileSync(staticServer+'/business/business_'+filedId+'_a.jpg', fs.readFileSync(files.upload.path));
            res.send({url:'/sevenRestuarant//business/business_'+filedId+'_a.jpg',Id:filedId}).status(200)
          }
        
        })
        
      }else{
        await fs.writeFileSync(staticServer+'/business/business_'+filedId+'.jpg', fs.readFileSync(files.upload.path));
        res.send({url:'/sevenRestuarant//business/business_'+filedId+'.jpg',Id:filedId}).status(200)
      }
    })
    
    // await updateProduct('menu_list','menu_img',`'/sevenRestuarant/comment/${foldId}/l${fildId}.jpg'`,'Id',`${fildId}`)
    
  })

})

router.get('/getdetailLists',async (req,res,next)=>{
  let order=await queryProduct('order_detail',true,'orderId',req.query.orderId)
if(order.length==0){
res.sendStatus(404)
}else{
  let business=await queryProduct('business',true,'Id',order[0].businessId)
  let base_user=await queryProduct('base_user',true,'Id',order[0].userId)
  let menu_list=await queryProduct('menu_list',true,'Id',order[0].menu_listId)
  // if(business.length!=0){
  //   order.business=business[0]
  // }
  let user={}
  if(base_user.length!=0){
    user.def_address=base_user[0]
  }
  if(menu_list.length!=0){
    order[0].detail=menu_list[0]
  }
  res.send({order,business:business[0],user}).status(200)
}
 
})

router.post('/getWXSession',async (req,res,next)=>{
  console.log(req.body)
  axios.get(
    'https://api.weixin.qq.com/sns/jscode2session?js_code='+req.body.js_code+'&appid='+req.body.appid+
    '&secret='+req.body.secret+'&grant_type='+req.body.grant_type
 
  ).then(async response=>{
    // console.log(response.data)
    let confirm=sha1(req.body.rawData+response.data.session_key)
    // console.log(confirm)
    if(confirm==req.body.signature){
      // response.data.openid 
      // req.body.userInfo nickName gender language city province country avatarUrl
      // 查询是否有账号密码是跟openid一致的
      let pass=await queryProduct('userlogin',true,'password',req.body.js_code,'wxflag','02')
      if(pass.length==0){
        res.send({status:true,reuslt:response.data,flag:true})
      }else{
        res.send({status:true,reuslt:response.data,flag:false})
      }
      
    }else{
      res.send({result:false})
    }
   
  }).catch(err=>{
console.log(err)
  })
  
})

router.post('/delAddress',async (req,res,next)=>{
console.log(req.body)
await deleteProduct('base_user','Id',req.body.Id)
let result=await queryProduct('base_user','Id',req.body.Id)
if(result.length==0){
  res.sendStatus(200)
}else{
  res.sendStatus(500)
}

})


// 移动端服务




module.exports = router;
