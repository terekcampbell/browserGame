function countdown(element, seconds, nextFunc, nextFuncArg1, nextFuncArg2) {
    $(element).css("display","block");
    if(seconds > 59) {
        var minute_text = Math.floor(seconds/60) + (seconds > 119 ? ' minutes' : ' minute');
    } else {
        var minute_text = '';
    }

    var second_text = seconds > 1 ? 'seconds' : 'second';
    $(element).html(minute_text + ' ' + seconds + ' ' + second_text);
    seconds--;

    var interval = setInterval(function() {
        console.log(seconds);
        if(seconds <= 0) {
            $(element).css("display","none");
            clearInterval(interval);
            return nextFunc(nextFuncArg1, nextFuncArg2);
        }

        if(seconds > 59) {
            minute_text = Math.floor(seconds/60) + (seconds > 119 ? ' minutes' : ' minute');
        } else {
            minute_text = '';
        }

        second_text = seconds > 1 ? 'seconds' : 'second';
        $(element).html(minute_text + ' ' + seconds + ' ' + second_text);
        seconds--;
    }, 1000);
}
