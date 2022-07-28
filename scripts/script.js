var wavesTestnet = ['https://nodes-testnet.wavesnodes.com', 'https://testnode2.wavesnodes.com', 'https://testnode3.wavesnodes.com', 'https://testnode4.wavesnodes.com']
var wavesMainnet = ['https://nodes.wavesexplorer.com']

$(document).on("click", ".list-group-item", function(e) {
    $("li").removeClass("active")
    $(e.target).addClass("active")

    var url = $(e.target).text()

    $("#nodeUrl").val(url)
})

$("#validate").click(function(e){
    $("#tansactions-table tbody tr").fadeOut(500, function(){
        $("#tansactions-table tbody tr").remove()
    })

    setTimeout(function(){
        var pointer = parsePointer($("#pointer").val())

        if (pointer == ''){
            alert("pointer is not set.")
            return
        }
        if (pointer.chain != "WAV"){
            alert("chain not suported")
            return
        }
        showChainLogo()
        showArrow()
        showAddress(pointer.add)
        
        $.get(`${wavesTestnet[0]}/transactions/address/${pointer.add}/limit/1000`, function(data, status){
            data[0].forEach((tx, i) => {
                bytes = (base58.decode(tx.attachment))
                var string = ""
                bytes.forEach(c => string+=String.fromCharCode(c))
                
                $("tbody").append(`
                    <tr id="tx-${tx.id}">
                        <th scope="row">${i}</th>
                        <td>${tx.id}</td>
                        <td>${string}</td>
                        <td>${tx.timestamp}</td>
                        <td>${new Date(tx.timestamp)}</td>
                    </tr>`).fadeIn(1000)
                
                 
            })
        }).fail(function(){alert("cannot make call")});
    }, 600)
})

$("#wavesMainnet").click(function(e){
    fillListGroup(wavesMainnet)
})

$("#wavesTestnet").click(function(e){
    fillListGroup(wavesTestnet)
})

function showChainLogo(){
    $("#chain-logo").append(`<img src="img/waves-logo.svg" height="45px" class="col-12">`)
    $("#chain-logo").append(`<span>Waves Network</span>`)
}

function showArrow(){
    $("#arrowDiv").append(`<div class="arrow" ><div class="head"></div></div>`)
}
function showAddress(add){
    $("#chain-address").append(`<span class="align-middle"><b>Network Address: </b><br></span>`)
   $("#chain-address").append(`<span class="align-middle">${add}</span>`)
}

function fillListGroup(links){
    $("#networkLinks").fadeOut(500, function(){
       $("#networkLinks").empty()

       var isFirst = true
       $("#nodeUrl").val(links[0])
       for (let i = 0; i < links.length; i++){
           var active = isFirst ? "active" : ""
           $("#networkLinks").append(`<li class="list-group-item ${active}">${links[i]}</li>`).fadeIn(500)
           isFirst = false
       }
    })
}

$(document).on("mouseenter", "tr", function(e){
    h = this.id.substring(3, this.id.length)
    bdtpBlock = $(`#${h}`)

    if(bdtpBlock.length){
        bdtpBlock.addClass("green")
        $(`#${this.id}`).addClass("green")
    }
})

$(document).on("mouseleave", "tr", function(e){
    h = this.id.substring(3, this.id.length)
    bdtpBlock= $(`#${h}`)

    if(bdtpBlock.length){
        bdtpBlock.removeClass("green")
        $(`#${this.id}`).removeClass("green")
    }
})

async function sha256(msgBuffer) {
    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}