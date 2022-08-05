var wavesTestnet = ['https://nodes-testnet.wavesnodes.com', 'https://testnode2.wavesnodes.com', 'https://testnode3.wavesnodes.com', 'https://testnode4.wavesnodes.com']
var wavesMainnet = ['https://nodes.wavesexplorer.com']

$(document).on("click", ".list-group-item", function(e) {
    $("li").removeClass("active")
    $(e.target).addClass("active")

    var url = $(e.target).text()

    $("#nodeUrl").val(url)
})

$("#validate").click(function(e){
    disableValidate()
    showTransactionDiv()
    $("#chain-address").fadeOut(500)
    $("tbody").empty()
    $("#arrowDiv").empty()
    var pointer = parsePointer($("#pointer").val())
    showChainLogo(pointer)
})

function showTransactionDiv(){
    $("#transactionDiv").fadeIn(500)
}

async function fetchFromWaves(pointer) {
    var ids = [];
    await $.get(`${wavesTestnet[0]}/transactions/address/${pointer.add}/limit/1000`, function(data, status){
        data[0].forEach((tx, i) => {
            bytes = (base58.decode(tx.attachment))
            var string = ""
            bytes.forEach(c => string+=String.fromCharCode(c))
            $("tbody").append(`
                <tr id="tx-${tx.id}" style="display: none">
                    <th scope="row">${i}</th>
                    <td><a href="https://testnet.wavesexplorer.com/tx/${tx.id}/" target="_blank">${tx.id}</a></td>
                    <td id="attachement-${tx.id}">${string}</td>
                    <td>${tx.timestamp}</td>
                    <td>${new Date(tx.timestamp)}</td>
                    <td class="text-center"><i id="i-${tx.id}" class="fa fa-circle-notch fa-spin"></i></td>
                </tr>
            `)
            $(`#tx-${tx.id}`).fadeIn(500)
            ids.push(tx.id)
        })
    }).fail(function(){alert("cannot make call")});
    validateTxs(ids, 0, 0)
}

async function validateTxs(ids, i, validated) {
    var isValid = await confirmTxContent($(`#attachement-${ids[i]}`).text(), ids[i])
    if(i+1 < ids.length ){
        validated = isValid? validated+1: validated
        setTimeout(() => validateTxs(ids, i+1, validated), 1000)
    }else{
        validated = isValid? validated+1: validated
        showValidationStatus(isValid)
    }
}

function disableValidate(){
    $("#validate").attr("disabled", true)
    $("#validate").empty()
    $("#validate").append(`Validating... <i class="fa fa-circle-notch fa-spin"></i>`)
}

function resetValidate(){
    $("#validate").attr("disabled", true)
    $("#validate").empty()
    $("#validate").append(`Validate Data`)
}

function showValidationStatus(isValid){
    var icon = isValid? "fa fa-check": "fa fa-times"
    var message = isValid? "Valid  ": "Invalid  "
    $("#validate").empty()
    $("#validate").append(`${message} <i class="${icon}"></i>`)
}

async function confirmTxContent(attachement, id){
    var h = await sha256(attachement)
    var el = $(`#${h}`)
    if(el.length === 1){
        $(`#${h}`).addClass('green')
        setTimeout(()=> $(`#${h}`).removeClass("green"), 500)
        $(`#i-${id}`).removeClass().addClass("fa fa-check green-text")
        return true;
    }
    else{
        $(`#i-${id}`).removeClass().addClass("fa fa-times red-text")
        return false;
    }
}

function showChainLogo(pointer){
    $("#chain-logo-div").fadeOut(500, ()=> {
        $("#chain-logo-div").empty()
        $("#chain-logo-div").append(`<a href="https://testnet.wavesexplorer.com/" target="_blank"><img src="img/waves-logo.svg" height="45px" class="col-12"><span>Waves Network</span></a>`)
        $("#chain-logo-div").fadeIn(1000, ()=> showArrow(pointer))
    })
}

function showArrow(pointer){
    $("#arrowDiv").empty()
    $("#arrowDiv").append(`<div class="arrow" ><div class="head"></div></div>`)
    setTimeout(()=> showAddress(pointer), 3000)
}
function showAddress(pointer){
    $("#chain-address").empty()
    $("#chain-address").append(`<a href="https://testnet.wavesexplorer.com/address/${pointer.add}/tx" target="_blank">${pointer.add}</a>`)
    $("#chain-address").fadeIn(500, ()=> fetchFromWaves(pointer))
}


$(document).on("mouseenter", "tr", async function(e){
    id = this.id.substring(3, this.id.length)
    h = await sha256($(`#attachement-${id}`).text())
    bdtpBlock = $(`#${h}`)
    if(bdtpBlock.length){
        bdtpBlock.addClass("green")
    }
})

$(document).on("mouseleave", "tr", async function(e){
    id = this.id.substring(3, this.id.length)
    h = await sha256($(`#attachement-${id}`).text())
    bdtpBlock= $(`#${h}`)

    if(bdtpBlock.length){
        bdtpBlock.removeClass("green")
    }
})

async function sha256(message) {
    const msgUint8 = new TextEncoder().encode(message);                          
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); 
    return hashHex;
}