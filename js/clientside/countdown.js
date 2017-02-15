function countdown(element, minutes, seconds, nextFunc, nextFuncArg) {
    $(element).css("display","block");
    if(minutes > 0) {
        var minute_text = minutes + (minutes > 1 ? ' minutes' : ' minute');
    } else {
        var minute_text = '';
    }

    var second_text = seconds > 1 ? 'seconds' : 'second';
    $(element).html(minute_text + ' ' + seconds + ' ' + second_text);
    seconds--;

    var interval = setInterval(function() {
        if(seconds == 0) {
            if(minutes == 0) {
                $(element).css("display","none");
                clearInterval(interval);
                return nextFunc(nextFuncArg);
            } else {
                minutes--;
                seconds = 60;
            }
        }

        if(minutes > 0) {
            minute_text = minutes + (minutes > 1 ? ' minutes' : ' minute');
        } else {
            minute_text = '';
        }

        second_text = seconds > 1 ? 'seconds' : 'second';
        $(element).html(minute_text + ' ' + seconds + ' ' + second_text);
        seconds--;
    }, 1000);
}
