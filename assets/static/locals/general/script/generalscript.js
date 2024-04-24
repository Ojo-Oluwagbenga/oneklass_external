
isOnMobile = false;
window.addEventListener("flutterInAppWebViewPlatformReady", function(event) {
    isOnMobile = true;
});

function _communicator(handler, data, callback){
    try {
        if (handler == 'writeCache'){
            let db = localStorage.getItem("handlerModel")
            if (!db){
                db = JSON.stringify({})
            }
            db = JSON.parse(db)

            data.forEach(packet => {
                db[packet[0]] = packet[1]
            });
            localStorage.setItem("handlerModel", JSON.stringify(db));
            callback(null);
        }
        if (handler == 'fetchCache'){
            let db = localStorage.getItem("handlerModel")
            if (!db){
                db = JSON.stringify({})
            }
            db = JSON.parse(db)
            let ret = {}
            data.forEach(key => {
                if (Object.keys(db).includes(key)){
                    ret[key] = db[key]
                }else{
                    ret = null;
                }
            });
            callback(ret);
        }
        if (handler == 'deleteCache'){
            let db = localStorage.getItem("handlerModel")
            console.log(db)
            if (!db){
                db = JSON.stringify({})
            }
            db = JSON.parse(db)

            data.forEach(ky => {
                delete db[ky];
            });
            localStorage.setItem("handlerModel", JSON.stringify(db));
            callback(null);
        }   
    } catch (error) {
        console.log(error)
        callback(false)
    }
}

let retry_communicator = 0;
function communicator(handler, data, callback){
    //THIS COMMUNICATOR WORKS FOR MEMORY INTERACTION FOLLOWING SPECIMEN 1 DESIGN
    try {
        //== MODEL AGAINST THE MISPROPER IN DB ASSIGNMENT
        if (handler=='writeCache'){
            write_intermid(data, (data)=>{
                window.flutter_inappwebview.callHandler(handler, ...data).then(stat=>{
                    callback(fap_interpreter(stat))
                });
            })
        }else{
            window.flutter_inappwebview.callHandler(handler, ...data).then(stat=>{
                callback(fap_interpreter(stat))
            });
        }
        
    } catch (error) {
        if (retry_communicator < 5){
            setTimeout(() => {
                communicator(handler, data, callback)
            }, 200);
        }else{
            callback(false)
        }        
    }
}
function write_intermid(_initial, cb){
    //BASICALLY THIS IS HAPPENING BECAUSE DATA CAN ONLY BE WRITTEN ONCE - SPECIMEN 1 ERROR
    window.flutter_inappwebview.callHandler("fetchCache", ...['rows']).then(stat=>{ //GET THE ROWS THAT CURRENTLY EXIST
        let ret = fap_interpreter(stat)
        let rows = []
        if (ret){
            rows = JSON.parse(ret['rows'])
        }
        
        let initial_data = {}
        let newrows = []
        _initial.forEach(entry => {
            initial_data[entry[0]]=entry[1]    
            newrows.push(entry[0])            
        });
        window.flutter_inappwebview.callHandler("fetchCache", ...rows).then(stat=>{ //FETCH ALL THE CURRENT VALUES OF THE EXISTING
            ret = fap_interpreter(stat)
            for (const rowname in ret) {
                if (!initial_data[rowname]){//ADD THOSE VALUES IF THEY WERE NOT IN THE REAL VALUES
                    _initial.push([rowname,ret[rowname]])   
                }      
                if (ret[rowname]){
                    if (!newrows.includes(rowname)){
                        newrows.push(rowname)
                    }
                }          
            }
            _initial.push(['rows', JSON.stringify(newrows)])
            cb(_initial);
        });
        
    });
}
function fap_interpreter(rets){
    retjson = {}
    try{
        rets.map((retitem)=>{
            retjson[retitem[0]['type']] = retitem[0]['packet']
        })
        return retjson;
    }catch (error) {
        return false;
    }
}