// TODO: Refactor to use object holding callback args
function countdown(element, seconds, nextFunc, nextFuncArg1, nextFuncArg2) {
    var minutes = Math.floor(seconds/60);
    seconds %= 60;
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
        if(seconds == -1) {
            if(minutes == 0) {
                $(element).css("display","none");
                clearInterval(interval);
                return nextFunc(nextFuncArg1, nextFuncArg2);
            } else {
                minutes--;
                seconds = 59;
            }
        }

        if(minutes > 0) {
            minute_text = minutes + (minutes > 1 ? ' minutes' : ' minute');
        } else {
            minute_text = '';
        }

        second_text = seconds !== 1 ? 'seconds' : 'second';

        if (minutes > 0 && seconds === 0) {
            $(element).html(minute_text);
        } else {
            $(element).html(minute_text + ' ' + seconds + ' ' + second_text);
        }
        seconds--;
    }, 1000);
}
