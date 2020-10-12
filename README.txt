## Cozi Website Instructions ##

Within the "Website" folder, check for:
    LAUNCH.html
    images (folder)
    stylesheet.css

To run the website, open the LAUNCH.html file through a web browser.

TEMPLATING INSTRUCTIONS:
To declare a variable:
Use the "!" followed by the variable name, an equals sign, and its value.

EX:
!name = Carter

To call on an existing variable, use "@" followed by the variable name. 

EX:
!name = Carter
@name
Output -> Carter

Variables may contain references to other variables as their values.

!firstName = Carter
!lastName = Selman
!fullName = @firstName @lastName
@fullName

Output -> Carter Selman

If the variable references is followed by a conjoined letter, use "{}" around the variable name to differentiate.

EX:
!name = Carter
That is @{name}'s food.

Output -> That is Carter's food.

To use a literal "@" sign without referencing a variable, use "@@".

EX:
!name = Carter
@@@name
Output -> @Carter

An exclamation mark ("!") followed by any non alphanumeric character will be treated as regular input and printed to the screen. In fact, any misunderstood cases will result in the line being printed to the screen.

EX:
!_+=3

Output -> !_+=3


