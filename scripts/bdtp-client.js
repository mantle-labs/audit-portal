function stringToBytes(str){
    var bytes = []

    for (var i = 0; i < str.length; ++i) {
        var code = str.charCodeAt(i)
        bytes = bytes.concat([code])
    }

    return bytes
}
function bdtpError(message){
    $("#bdtp-message").empty()
    $("#bdtp-message").text(message)
}


/******Process bdtp chunk because google sockets uses 4096bytes chunks  */
var remainingBytes = []
var dataSize = -1
var readCount = 0

function computeHashAndDisplaybytes(bytes){

    h = base58.sha256(bytes).then(h => {
        $("#bdtp-data").append(`<span id="${h}" class="bdtp-block">${bytes}</span>`)
        var string = "";
        bytes.forEach(c => string+=String.fromCharCode(c))
        $(`#${h}`).text(string)
    })
}

async function processChunk(chunk){
    var currentChunk = remainingBytes == undefined ? chunk :remainingBytes.concat(Array.from(chunk))

    var offset = 0
    for (var i = 0; i<30;i++){

        if(offset>currentChunk.length){
            break
        }

        if(currentChunk.length < offset + 140){
            if (readCount + 140 < dataSize){
                return currentChunk.slice(offset, currentChunk.length)
            }
            end = currentChunk.length
            
        }else{
            end = offset +140
        }
        var bytes = currentChunk.slice(offset, end)
        computeHashAndDisplaybytes(bytes)

        offset += 140
        readCount +=140
    }
   return []
}
function fetchAndDisplayBytes(data){
    disableFetchBtn()
    $("#bdtp-data").empty()

    //call bdtp
    processChunk(data).then(remaining => {
        remainingBytes = Array.from(remaining)
    })

    enableValidateBtn()
    return
}

function parseInt(array) {
    var value = 0;
    for (var i = 0; i < array.length; i++) {
        value = (value * 256) + array[i];
    }
    return value;
}

function enableValidateBtn(){
    $("#validate").attr("disabled", false)
}

function disableFetchBtn(){
    $("#bdtp").attr("disabled", true)
}

function enableFetchBtn(){
    $("#bdtp").attr("disabled", false)
}

function resetUI(){
    $("#transactionDiv").fadeOut(500)
    $("#bdtp-data").empty()
    $("#bdtp-data").append(`<span class="justify-content-center align-items-center"><b id="bdtp-message">Waiting for bdtp data...</b></span>`)
    $("#chain-logo-div").empty()
    $("#arrowDiv").empty()
    $("#chain-address").empty()
    $("#progress-bar").empty()
    $("#progress-bar").css({'width': "0"})
    $("#progress-bar").stop()
    $("#transaction-counter").text(`${0}/${0} Transactions processed`)

    resetValidate()
}

$(document).on("mouseenter", ".bdtp-block", function(e){
    tx = $(`#tx-${e.target.id}`)
    if(tx.length){
        tx.addClass("green")
        $(e.target).addClass("green")
    }
})

$(document).on("mouseleave", ".bdtp-block", function(e){
    tx = $(`#tx-${e.target.id}`)
    if(tx.length){
        tx.removeClass("green")
        $(e.target).removeClass("green")
    }
})



/*****socket********/
var SOCKET_ID = 0

$("#pointer").change(function (){
    enableFetchBtn()
})

function listen(socketId){
    console.log("ready to receive data")
}

function parsePointer(pointer){
    if(pointer == ""){
        return null
    }

    return {chain: pointer.substring(0,3), add: pointer.substring(3)}
}

function onAccept(){    
    console.log("accepted")
    var ptrStr = parsePointer($("#pointer").val())
    if (ptrStr == null){
        return
    }
    ptrStr.add = base58.decode(ptrStr.add)

    buff = new ArrayBuffer(ptrStr.chain.length + ptrStr.add.length + 4)
    
    buffArr = new Uint8Array(buff)
    for  (i = 0; i< buffArr.length; i++){
        if (i<3){
            buffArr[i] = ptrStr.chain.charCodeAt(i)
        }
        if(i>=3 && i < 29){
          buffArr[i] = ptrStr.add[i-3]
        }
        if (i>= 29){
          buffArr[i] =0
        }
    }

    chrome.sockets.tcp.send(SOCKET_ID, buffArr, listen)
}

function Handler(info){
    if (info.socketId == SOCKET_ID){
        //4096bytes
        var data = new Uint8Array(info.data)
        if(dataSize === -1){
            var s = parseInt(data.slice(0,4))
            dataSize = s
            data = data.slice(4)
        }

        console.log("try to display bytes")
        fetchAndDisplayBytes(data)
        chrome.sockets.tcp.disconnect(info.socketId)        
    }  
}

$("#bdtp").click(async function(e){
    remainingBytes = []
    dataSize = -1
    readCount = 0
    resetUI()

    if (chrome.sockets == undefined){
        console.log("google socket undefined")
        return
    }

    if ($("#pointer").val()==""){
        return
    }
    connectSocket()
})

function connectSocket(){
    console.log("trying to set up socket...")
    chrome.sockets.tcp.create({}, function(createInfo) {
        SOCKET_ID = createInfo.socketId
        chrome.sockets.tcp.connect(SOCKET_ID,"localhost", 4444, onAccept)
    })
    chrome.sockets.tcp.onReceive.addListener(Handler);

    chrome.sockets.tcp.onReceiveError.addListener(e => console.log(e))
}