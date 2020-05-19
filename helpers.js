function combineArrays( array_of_arrays ){
    if(!array_of_arrays) {
        return [];
    }

    if(!Array.isArray(array_of_arrays)) {
        return [];
    }

    if(array_of_arrays.length == 0 ) {
        return [];
    }

    for (let i = 0; i < array_of_arrays.length; i++) {
        if(!Array.isArray(array_of_arrays[i]) || array_of_arrays[i].length == 0 ) {
            return [];
        }
    }

    let odometer = new Array(array_of_arrays.length);
    odometer.fill(0); 

    let output = [];

    let newCombination = formCombination(odometer, array_of_arrays);

    output.push(newCombination);

    while (odometer_increment(odometer, array_of_arrays)) {
        newCombination = formCombination(odometer, array_of_arrays);
        output.push(newCombination);
    }

    return output;
}


function formCombination(odometer, array_of_arrays) {

    return odometer.reduce(
        function (accumulator, odometer_value, odometer_index) {
            accumulator.push(array_of_arrays[odometer_index][odometer_value]);
            return accumulator;
        },
        []
    );
}

function odometer_increment(odometer, array_of_arrays) {


    for (let i_odometer_digit = odometer.length-1; i_odometer_digit >=0; i_odometer_digit-- ) { 

        let maxee = array_of_arrays[i_odometer_digit].length - 1;         

        if (odometer[i_odometer_digit] + 1 <= maxee) {
            odometer[i_odometer_digit]++;
            return true;
        } else {
            if (i_odometer_digit - 1 < 0) {
                return false;
            } else {
                odometer[i_odometer_digit] = 0;
                continue;
            }
        }
    }

}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }

    return true;
}

const randomItem = items => items[Math.floor(Math.random() * items.length)];