var varDict = {};
var incorrectFormat = false;

function parseVars(input){ // parse variable names and inputs
    var regex = /[a-z0-9]/i
    if(input.charAt(0) == "!"){
        var findEquals = input.indexOf("=");
        if(findEquals==-1){
            incorrectFormat = true;
        }
        var name = input.toString().substr(1, findEquals-1);
        var value = input.toString().substr(findEquals+1, input.length);
        name = name.trim();
        value = value.trim();
        if(!(regex.test(name)) | value == ""){
            incorrectFormat = true;
        }
        varDict[name] = value;
    }
}


function includeLine(input){ // Decide if it is a variable declaration or line of text
    var regex = /[a-z0-9]/i
    if(input.substr(0,1) == "!" & regex.test(input.charAt(1))){
        return false;
    }
    return true;
}


function parseAt(input){ // parse the @variable references in text
    var curAt = input.indexOf("@");

    var replaceVal = "";
    var regex = /[a-z0-9]/i;
    
    var curChar = 0;
    if(curAt != -1){
        if(input.charAt(curAt+1)=="@"){
            var inc = 1;
            while(input.charAt(curAt+1+inc)=="@"){ // @@@@@
                inc += 1;
            }
            if(inc % 2 == 0){
                curAt = curAt+inc;
                if(input.charAt(curAt+1)=="{"){
                    input = parseAtBrackets(input, curAt);
                }
                else{
                    input = parseAtNoBrackets(input, curAt);
                }
                input = parseAt(input);
            }
        }
        else if(input.charAt(curAt+1)=="{"){
            input = parseAtBrackets(input, curAt);
            input = parseAt(input);
        }
        else{
            input = parseAtNoBrackets(input, curAt);
            input = parseAt(input);
        }
    }
    return input;
}

function parseAtNoBrackets(input, curAt){ // helper function for variables without brackets
    var replaceVal = "";
    var regex = /[a-z0-9]/i;

    curChar = input.charAt(curAt+1);
    var counter = 0;
    while(regex.test(curChar) & (curAt + counter) < input.length){
        curChar = input.charAt(curAt+2+counter);
        counter+=1;
    }
    replaceVal = varDict[input.substring(curAt+1, curAt+1+counter)];
    if(typeof replaceVal !== 'undefined'){
        return input.substring(0, curAt) + replaceVal + input.substring(curAt+counter+1);
    }
    return "ERROR: Variable referenced before declaration.";
}

function parseAtBrackets(input, curAt){ // helper function for variables with brackets
    var replaceVal = "";
    var regex = /[a-z0-9]/i;

    var curBraceOpen = 0;
    var curBraceClose = 0;

    curBraceOpen = curAt+1;
    curBraceClose = input.indexOf("}", curBraceOpen);
    if(curBraceClose == -1){
        return "ERROR: Illegal variable reference."
    }
    replaceVal = varDict[input.substring(curAt+2, curBraceClose)];
    if(typeof replaceVal !== 'undefined'){
        return input.substring(0, curAt) + replaceVal + input.substring(curBraceClose+1);
    }
    return "ERROR: Variable referenced before declaration.";
}



function sortText(text){ // sort the text by line into an array. Perform necessary functions on each line
    var output = [];
    text = text.toString();
    var backInd = 0;
    var frontInd = text.indexOf("\n");
    if(frontInd == -1){
        frontInd = text.length-1;
    }
    var curLine;
    while(frontInd != -1 & frontInd < text.length){
        curLine = text.substring(backInd, frontInd+1);
        if(includeLine(curLine)){
            output.push(curLine);
        }else{
            parseVars(curLine);
        }
        backInd = frontInd + 1;
        frontInd = text.indexOf("\n", backInd);

        if(frontInd == -1 & frontInd < text.length){
            curLine = text.substring(backInd, text.length);
            if(includeLine(curLine)){
                output.push(curLine);
            }else{
                parseVars(curLine);
            }
        }
    }
    return output;
}



function removeDoubleAt(textArray){ // Remove double At signs (@@)
    for(var text = 0; text < textArray.length; text++){
        var charAt = 0;
        var counter = 0;
        while(charAt != -1 & charAt < textArray[text].length){
            charAt = textArray[text].indexOf("@", charAt + 1);
            
            if(charAt != -1){
                counter += 1;
            }
        }
        counter = counter / 2;
        
        for(var i = 0; i < counter; i++){
            charAt = textArray[text].indexOf("@", charAt+1);
            if(charAt != -1){
                if(textArray[text].charAt(charAt+1)=="@"){
                    textArray[text] = textArray[text].substring(0, charAt) + textArray[text].substring(charAt+1, textArray[text].length);
                }
            }   
        }
    }
    return textArray;
}   

function switchIn(textArray){ // parse the @ values if they are not double @@
    var checkAt;
    for(var text = 0; text < textArray.length; text++){
        textArray[text] = parseAt(textArray[text]);
    }

    for(var line in textArray){
        checkAt = line.indexOf("@");
        if(checkAt != -1 & line.charAt(checkAt+1) != "@"){
            switchIn(textArray);
        }
    }
    return textArray;
}

function createTemplate(input){ // given input from html file, perform necessary ops
    var output = "";
    var textArray = sortText(input);
    textArray = switchIn(textArray);
    textArray = removeDoubleAt(textArray);

    if(incorrectFormat){
        output = "incorrect format";
        return output;
    }

    for(var text = 0; text < textArray.length; text++){
        output += textArray[text] + "<br>";
    }
    return output;
}

function submit(){ // Input / Output on submission
    varDict = {};
    incorrectFormat = false;
    var input = document.getElementById("userInput").value;
    var output = createTemplate(input);
    document.getElementById("outMessage").innerHTML = output;
}



/*
A FEW NOTABLE TESTS:
createTemplate("!name1=John Q.\n!name2=Smith\n!salutation=Dear @name1 @name2\n1 Infinite Loop\n!product=Horcrux Widget\nSomewheresville, CA 98765\n\n@salutation,\n\nThank you for your interest in @{product}s.\nUnfortunately, we sold our last @product yesterday.\n\n@name1, if you have any more questions about our products,\nemail us at support@@horcrux.com<http://horcrux.com>, tweet to @@horcrux_support,\nor call us @@ 1-800-HORCRUX.")
createTemplate("!a=@b\n!b=@a"\n@a) // Won't output anything to screen.
createTemplate("!a=@b\n!b=@c\n!c=Hello"); // Nesting values in variables
createTemplate("!!!@@@@") // Parses the double @'s and doesn't throw error for using variable declaration symbol (!). Treats non-alphanumeric values proceding (!) as regular text
createTemplate(!1=@2\n!2=Hello) // Using numbers for variable names
createTemplate(!test=Test\n@@@test) // Parsing @ signs and referencing variable
createTemplate(!a=@@\n@a@a) // Parsing @ signs from variables at declaration
*/