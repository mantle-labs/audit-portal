var wavesTestnet = ['https://nodes-testnet.wavesnodes.com', 'https://testnode2.wavesnodes.com', 'https://testnode3.wavesnodes.com', 'https://testnode4.wavesnodes.com']
var wavesMainnet = ['https://nodes.wavesexplorer.com']

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
    var ids = []
    var bytesArray = []
    await $.get(`${wavesTestnet[0]}/transactions/address/${pointer.add}/limit/1000`, function(data, status){
        data[0].forEach(async (tx, i) => {
            ids.push(tx.id)
            bytes = base58.decode(tx.attachment)
            bytesArray.push(bytes)
            var string = ""
            bytes.forEach(c => string+=String.fromCharCode(c))
            $("tbody").append(`
                <tr id="tx-${tx.id}" class="text-font" style="display: none">
                    <th scope="row">${i}</th>
                    <td><a href="https://testnet.wavesexplorer.com/tx/${tx.id}/" target="_blank">${tx.id}</a></td>
                    <td id="attachement-${tx.id}"></td>
                    <td>${new Date(tx.timestamp)}</td>
                    <td class="text-center"><i id="i-${tx.id}" class="fa fa-circle-notch fa-spin fa-2x"></i></td>
                </tr>
            `)
            $(`#tx-${tx.id}`).fadeIn(500)
            $(`#attachement-${tx.id}`).text(string)
        })
    }).fail(function(){alert("cannot make call")})
    validateTxs(ids, bytesArray, 0, 0)
}

async function validateTxs(ids, bytesArray, i, validated) {
    if($("#chain-address").text()===""){
        return
    }
    var isValid = await confirmTxContent(bytesArray[i], ids[i])
    if (isValid){
        txProgressBarUpdater(ids.length, i+1)
    }
    if(i+1 < ids.length ){
        validated = isValid? validated+1: validated
        setTimeout(() => validateTxs(ids, bytesArray, i+1, validated), 10)
    }else{
        validated = isValid? validated+1: validated
        showValidationStatus(validated === ids.length)
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
    $("#validate").append(`Validate <span class="fs-it-btn-vertical-line"></span><i class="fa fa-file-check">`)
}

function showValidationStatus(isValid){
    var icon = isValid? "fa fa-check": "fa fa-times"
    var message = isValid? "Valid": "Invalid"
    $("#validate").empty()
    $("#validate").append(`${message} <i class="${icon}"></i>`)
}

async function confirmTxContent(attachement, id){
    var h = await base58.sha256(attachement)
    var txEl = $(`#i-${id}`)
    var hEl = $(`#${h}`)

    if(hEl.length === 1){
        hEl.addClass('green')
        hEl.attr('id', `bdtp-${id}`)
        setTimeout(()=> $(`#bdtp-${id}`).removeClass("green"), 500)
        txEl.removeClass().addClass("fa fa-check fa-2x green-text")
        return true
    }
    else{
        txEl.removeClass().addClass("fa fa-times fa-2x red-text")
        return false
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
    bdtpChunk = $(`#bdtp-${id}`)
    if(bdtpChunk.length){
        bdtpChunk.addClass("green")
    }
})

$(document).on("mouseleave", "tr", async function(e){
    id = this.id.substring(3, this.id.length)
    bdtpChunk = $(`#bdtp-${id}`)
    if(bdtpChunk.length){
        bdtpChunk.removeClass("green")
    }
})

function txProgressBarUpdater(length, i) {
    var el = $("#progress-bar")
    var width = i/length*100
    el.css({width: `${width}%`})
    $("#transaction-counter").text(`${i}/${length} Transactions processed`)
}