var wavesTestnet = ['https://nodes-testnet.wavesnodes.com', 'https://testnode2.wavesnodes.com', 'https://testnode3.wavesnodes.com', 'https://testnode4.wavesnodes.com']
var wavesMainnet = ['https://nodes.wavesexplorer.com']

$(document).on("click", ".list-group-item", function(e) {
    $("li").removeClass("active")
    $(e.target).addClass("active")

    var url = $(e.target).text()

    $("#nodeUrl").val(url)
})

$("#validate").click(function(e){
    $("tbody").empty()
    var pointer = parsePointer($("#pointer").val())

    if (pointer == ''){
        alert("pointer is not set.")
        return
    }
    if (pointer.chain != "WAV"){
        alert("chain not suported")
        return
    }
    showChainLogo(pointer)
})

async function fetchFromWaves(pointer) {
    var ids = [];
    await $.get(`${wavesTestnet[0]}/transactions/address/${pointer.add}/limit/1000`, function(data, status){
        data[0].forEach((tx, i) => {
            bytes = (base58.decode(tx.attachment))
            var string = ""
            bytes.forEach(c => string+=String.fromCharCode(c))
            
            $("tbody").append(`
                <tr id="tx-${tx.id}">
                    <th scope="row">${i}</th>
                    <td>${tx.id}</td>
                    <td id="attachement-${tx.id}">${string}</td>
                    <td>${tx.timestamp}</td>
                    <td>${new Date(tx.timestamp)}</td>
                    <td class="text-center"><i id="i-${tx.id}" class="fa fa-circle-notch fa-spin"></i></td>
                </tr>`).fadeIn(1000)
                ids.push(tx.id)
        })
    }).fail(function(){alert("cannot make call")});
    validateTxs(ids, 0)
}

function validateTxs(ids, i) {
    confirmTxContent($(`#attachement-${ids[i]}`).text(), ids[i])
    if(ids.length >= i){
        setTimeout(() => validateTxs(ids, i+1), 1000)
    }
}

async function confirmTxContent(attachement, id){
    var h = await sha256(attachement)
    $(`#${h}`).addClass('green')
    console.log($(`#${h}`))
    setTimeout(()=> $(`#${h}`).removeClass("green"), 500)
    $(`#i-${id}`).removeClass().addClass("fa fa-check")
}

$("#wavesMainnet").click(function(e){
    fillListGroup(wavesMainnet)
})

$("#wavesTestnet").click(function(e){
    fillListGroup(wavesTestnet)
})

function showChainLogo(pointer){
    $("#chain-logo-div").fadeOut(1000, ()=> {
        $("#chain-logo-div").empty()
        $("#chain-logo-div").append(`<img src="img/waves-logo.svg" height="45px" class="col-12"><span>Waves Network</span>`)
        $("#chain-logo-div").fadeIn(1000, ()=> showArrow(pointer))
    })
}

function showArrow(pointer){
    $("#arrowDiv").empty()
    $("#arrowDiv").append(`<div class="arrow" ><div class="head"></div></div>`)
    setTimeout(()=> showAddress(pointer), 3000)
}
function showAddress(pointer){
   $("#chain-address").text(pointer.add)
   $("#chain-address").fadeIn(500, ()=> fetchFromWaves(pointer))
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

async function sha256(message) {
    const msgUint8 = new TextEncoder().encode(message);                          
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); 
    return hashHex;
}