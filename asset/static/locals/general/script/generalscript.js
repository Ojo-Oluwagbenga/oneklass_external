//For the Nav Bar 
let __user_data = JSON.parse(sessionStorage.getItem("user_data"));

function pageSetup(){
    try {
        
        let curl = window.location.href;
        let curl_split = curl.split("/")
        let acode = curl_split[curl_split.length - 1];
        console.log("----", acode);
        $(`[redir="/${acode}"]`).css({color:"#711dd8", fill:"#711dd8"});

        $(".limited").each(function(){
            let to = $(this).attr("to");            
            if(!to.split(" ").includes(__user_data.user_type)){
                $(this).remove();
            }
        })
        if (__user_data.accept_status != 1){
            $(".unsigned").css("display", "block");
        }
        $(".__to_load").each(function(){
            const toload  = $(this).attr("item");
            $(this).text(__user_data[toload]);
        })
    } catch (error) {
            
    }
}
pageSetup();

$(".nav-item").click(function(){
    let redir = $(this).attr('redir');
    if ( typeof(redir) != 'undefined'){
        window.location.href = redir;
    }
})

$("#db-logout").click(function(){        
    confirmChoice({
        head:"Log Out",
        text:"Are you sure you want clear cache and log out?",
        negativeCallback:()=>{},
        positiveCallback:logout
    })
})

function logout(){
    popAlert("Logging out..."); 
    axios({
        method: 'POST',
        url: '../api/user/logout',
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
        },
        data: {}
    }).then(response => {
        response = response.data;
        console.log(response);

        if (response.passed){
            location.reload();
        }else{
            popAlert("Unable to destroy session")
        }
    }).catch(error => console.error(error))  
    
}
