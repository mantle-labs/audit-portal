var SOCKET_ID = 0
var remainingBytes = []
var dataSize = -1
var readSize = 0

function parsePointer(pointer){
    if(pointer == ""){
        return null
    }
    pointer = {chain: pointer.substring(0,3), add: pointer.substring(3)}
    return pointer
}

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

function sendDataHandler(){
    remainingBytes = []
    dataSize = -1
    readSize = 0
    console.log("Connected ! sending pointer")  
    pointer = parsePointer($("#pointer").val())
    if(pointer == null){
        bdtpError("Please enter a pointer")
        return
    }
    else if(pointer.chain != "WAV"){
        bdtpError("Chain not supported")
    }
    pointer.add = base58.decode(pointer.add)

    buff = new ArrayBuffer(pointer.chain.length + pointer.add.length +4)
    buffArr = new Uint8Array(buff)
    for  (i = 0; i< buffArr.length; i++){
        if (i<3){
            buffArr[i] = pointer.chain.charCodeAt(i)
        }
        if(i>=3 && i < 29){
          buffArr[i] = pointer.add[i-3]
        }
        if (i>= 29){
          buffArr[i] =0
        }
    }

    chrome.sockets.tcp.send(SOCKET_ID, buffArr, receiveDataHandler)

    chrome.sockets.tcp.onReceive.addListener(function(info) {
        if (info.socketId == SOCKET_ID){
            data = Array.from(new Uint8Array(info.data))
            if(dataSize === -1){
                dataSize = parseInt(data.slice(0,4))
                data = data.slice(4)
            }
            displayBytes(data, index)
            index++
        }   
      })
}

function receiveDataHandler(socketId){
    console.log("ready to receive data")
}

function displayBytes(chunk){
    disableFetchBtn()
    $("#bdtp-data").empty()
    offset = 0
    chunk = remainingBytes.concat(chunk)

    var i = 0
    for (;;){
        if(offset +140 > chunk.length){
            if(readSize +offset+140 >= dataSize){
                end = chunk.length
            }
            else{
                remainingBytes = chunk.slice(offset)
                
                break
            }
        }else{
            end = offset +140
        }

        computeHashAndDisplaybytes(chunk, offset, end)
        if(offset>chunk.length){
            offset += chunk.slice(offset).length - 1
            break
        }
        offset += 140
    }
    readSize += offset
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

async function computeHashAndDisplaybytes(bytes, start, end){
    sha256(bytes.slice(start, end)).then(h => {
        $("#bdtp-data").append(`<span id="${h}" class="bdtp-block"></span>`)
        var string = "";
        bytes.slice(start, end).forEach(c => string+=String.fromCharCode(c))
        $(`#${h}`).text(string)
     })
}

$("#bdtp").click(async function(e){
    resetUI()
    if (chrome.sockets == undefined){
        displayBytes(hc)
        return
    }
    pointer = parsePointer($("#pointer").val())
    if(pointer == null){
        bdtpError("Please enter a pointer")
        return
    }
    else if(pointer.chain != "WAV"){
        bdtpError("Chain not supported")
        return
    }
    console.log("trying to set up socket...")
    chrome.sockets.tcp.create({}, function(createInfo) {
        SOCKET_ID = createInfo.socketId
        chrome.sockets.tcp.connect(SOCKET_ID,
          "localhost", 4444, sendDataHandler)
      })
})

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

$("#pointer").change(function (){
    enableFetchBtn()
})