const db=require('./connection')

// let addProduct=(item)=>{
//     return new Promise((res,reject)=>{
//         db.query('select * from '+tablename+' where username='+username+' and password='+password,(err,rows)=>{
//             if(err){
//               reject(err)
//             }
//             resolve(rows)
//           })
//     })
// }

let queryProduct=(tablename,param,value)=>{
    // console.log(db)
    if(tablename=='menu_type'||tablename=='base_user'){
      return new Promise((resolve,reject)=>{
        db.conn('select * from '+tablename,(err,rows)=>{
            if(err){
              reject(err)
            }
            resolve(rows)
          })
    })
    }else{
      return new Promise((resolve,reject)=>{
        db.conn('select * from '+tablename+' where '+param+"="+"'"+value+"'",(err,rows)=>{
            if(err){
              reject(err)
            }
            resolve(rows)
          })
    })
    }
    
}

let queryOperation=(tablename,flag)=>{
  // console.log(db)
  if(flag=='maxId'){
    return new Promise((resolve,reject)=>{
      // select max(Id) from menu_list
      console.log('select  max(Id) as Id from '+tablename)
      db.conn('select  max(Id) as Id from '+tablename,(err,rows)=>{
          if(err){
            reject(err)
          }
          resolve(rows)
        })
  })
  }
  if(flag=='distinct'){

  }

}

let updateProduct=(tablename,setparam,setvalue,findparam,findvalue)=>{
    // console.log(db)
    return new Promise((resolve,reject)=>{
      //  console.log("update "+tablename+" set "+setparam+"="+setvalue+' where '+findparam+" = "+findvalue)
        db.conn("update "+tablename+" set "+setparam+"="+setvalue+' where '+findparam+" = "+findvalue,(err,rows)=>{
            if(err){
              reject(err)
            }
            resolve(rows)
          })
    })
}


let insertProduct=(tablename,v1,v2,v3,v4,v5,v6,v7,v8,v9,v10,v11)=>{
  // console.log(...insertDate)
  if(tablename=='menu_list'||tablename=='menu_price'){
    return new Promise((resolve,reject)=>{
      // insert into menu_list
    // values(14,'菜菜1','/sevenRestuarant/menu_lists/t2/menu24077.jpg','20','东莞的根深蒂固','25',3,'l14','s,m,l')
    // 八个参数的
        db.conn(`insert into ${tablename} values(${v1},${v2},${v3},${v4},${v5},${v6},${v7},${v8})`,(err,rows)=>{
            if(err){
              reject(err)
            }
            resolve(rows)
          })
    })
  }


  else if(tablename=='menu_size'){
    return new Promise((resolve,reject)=>{
      db.conn(`insert into ${tablename} values(${v1},${v2},${v3},${v4},${v5})`,(err,rows)=>{
        if(err){
          reject(err)
        }
        resolve(rows)
      })
    })
  }
 
  else if(tablename=='menu_type'){
    return new Promise((resolve,reject)=>{
      console.log(`insert into ${tablename} values(${v1},${v2},${v3},${v4})`)
      db.conn(`insert into ${tablename} values(${v1},${v2},${v3},${v4})`,(err,rows)=>{
        if(err){
          reject(err)
        }
        resolve(rows)
      })
    })
  }
  else if(tablename=='base_user'){
    return new Promise((resolve,reject)=>{
      console.log(`insert into ${tablename} values(${v1},${v2},${v3},${v4},${v5},${v6},${v7},${v8},${v9},${v10},${v11},${v11})`)
      db.conn(`insert into ${tablename} values(${v1},${v2},${v3},${v4},${v5},${v6},${v7},${v8},${v9},${v10},${v11},${v11})`,(err,rows)=>{
        if(err){
          reject(err)
        }
        resolve(rows)
      })
    })
  }
  }



exports.queryProduct=queryProduct
exports.queryOperation=queryOperation
exports.updateProduct=updateProduct
exports.insertProduct=insertProduct