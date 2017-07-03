# Scenária
## A JavaScript scene editor for Box2D with behavior programming

## Table of contents
* [Examples and links](#examples-and-links)
* [Quick glossary](#quick-glossary)
* [The enviroment](#the-enviroment)
* [World](#world)
* [Entities](#entities)
* [Joints](#joints)
* [Behavior](#behavior)
 * [Value holders](#value-holders)
 * [Entity filters](#entity-filters)
 * [Actions](#actions)

## Examples and links

First things first, here's a link to the newest deployed version of the editor: [https://jkbmat.github.io/bakalarska-praca-dist/](https://jkbmat.github.io/bakalarska-praca-dist/).

And here's some examples of Scenária in action:
* [Voleyball](https://jkbmat.github.io/bakalarska-praca-dist/#27fcde37-d8e0-40e2-bfe6-90c88689603c)
* [Pong](https://jkbmat.github.io/bakalarska-praca-dist/#ca279676-b8a2-48a4-b67c-30c1a59af6ed)
* [Weird Pong](https://jkbmat.github.io/bakalarska-praca-dist/#f9935f21-9b56-47e5-9797-f74c6a3afe1e) with dampened weld joints

Controls: WASD and arrow keys

## Quick glossary
* **Entity** is a combination of Box2D's body, shape and fixture. Scenária doesn't support entities with multiple shapes. The workaround for this issue is to use weld joints.
* **Joint** holds two entities together and defines their interaction

## The enviroment

*Here's how the editor looks once it's freshly started:*
![The enviroment](/readme-files/enviroment.png)

The main sections are:

1. Workspace
  * The place for entity and joint manipulation
2. Contextual sidebar
  * Shows information about the currently selected object
  * Can be resized
3. Entity list
  * Shows a list of all existing entities, their colors and types.
  * Allows for quick selection of an entity
4. Toolbar
  * Contains elements controlling the enviroment
  * **Start/Stop button** controls the running state of the simulation
  * **Save/Load buttons** allows the user to save or load scenes to the local machine or the internet
  * **Remove all button** removes all entities and joints from the scene
  * **Undo/Redo buttons** step through scene history one step backwards/forwards
  * **Collision groups button** sets which collision groups should and should not interact. More on this in section [Entities](#entities).
  * **Tool buttons**
    * Select tool is used for selecting and repositioning entities and joints
    * Rectangle and circle tools are used for creating new entities with their respective shapes
  * **Joint buttons** are used for creating new joints. More on this in the section [Joints](#joints)
  * **Zoom slider** controls the zoom level of the enviroment
  * **Language chooser** allows changing the editor's language
    * Language files are located in the folder [/app/translations/](/app/translations/). Feel free to translate the editor to any language of your choice!
    
## World
If no joints or entities are selected, the contextual sidebar shows information about the simulation world.
Here you can set the gravity vector and camera style.

Camera can be either:
* **Locked on point**: Static
* **Locked on entity**: Always centered on an entity of your choice

## Entities
To add a new entity to the simulation, simply choose the desired tool and create the entity in the work space using drag & drop. It will be assigned default attributes and a random color.
Each entity is assigned a layer and a collision group. Layers determine the order in which entities are drawn. Collision groups determine which entities should interact with which other entities.
The Collision groups window, accessible form the toolbar, is a place to define collision group interaction.

![Collision groups window](/readme-files/collision-groups.png)

*Collision groups 2 and 3 will now no longer interact*

Aside from layer and collision group number, an entity has the following attributes:
* **ID**: A name, so to speak
* **X/Y position**
* **Width/Height**
* **Rotation**
* **Fixed rotation**: The entity's rotation will stay fixed
* **Restitution**: "Bounciness" of the entity.
* **Friciton**
* **Density**: Combined with its dimensions, density determines an entity's weight
* **Precise collision checking at high velocities**: Also called the bullet flag. Improves collision checking of quick moving entities, so they don't pass through thin entities. This is hovewer more computation-intense.
* **Color**
* **Body type**
  * Dynamic: The basic entity type
  * Static: Immovable entity. Has infinite mass and cannot be moved by any interactions, impulses or forces.
  * Kinematic: Same as the static body type, but can be interacted with using impulses and forces. It also has infinite mass, so interaction with static entities is ignored (Interaction of two objects with infinite mass is not defined in Newtonian physics).

## Joints

Joints bind two entities together and change how they behave. To create a joint, first click on the joint's button in the toolbar. A dialog will appear in the contextual sidebar, where the connected entities need to be chosen.

After creating the joint, the following attributes can be changed:
* **ID**: Name of the joint. Unused as of yet.
* **Connected entities should collide**
* **Connected entities and the relative positions of the joint**

Each type of joint can also have additional attributes:
* **Weld joint**: Holds two entities together at fixed distance and angle
 * **Damping frequency**: How often the entities' positions should be corrected. 0 is fixed positions, otherwise the lower, the bouncier.
* **Revolute joint**: The two entities rotate about a common point (imagine a hinged door).
* **Rope joint**: Constricts maximal distance between two entities
 * **Maximum rope length**
 
## Behavior

The real strength of Scenária lies in editing Entities' behaviors. The behavior editor can be accessed by clicking on Set behavior button in the contextual sidebar when an entity is selected.

The behavior system is strongly typed using the following types:
* ***boolean***
* ***number***
* ***string***
* ***action***
* ***entityfilter***
* ***literal***

A behavior comprises of two parts:
* **One condition**: *(type: boolean)* Is checked on every frame
* **One or more actions**: *(type: action)* If the condition is fulfilled, all of the behavior's actions are carried out.

An entity can have any number of behaviors.

The full list of implemented commands is as follows:

### Value holders

Name|Type|Arguments|Description
----|----|---------|-----------
AND|*boolean*|<ul><li>Operand A *boolean*</li><li>Operand B *boolean*</li></ul>|Evaluates to true if both operands are true, false otherwise
OR|*boolean*|<ul><li>Operand A *boolean*</li><li>Operand B *boolean*</li></ul>|Evaluates to true if at least one of the operands is true, false otherwise
NOT|*boolean*|<ul><li>Operand *boolean*</li></ul>|Reverses the value of the operand
true|*boolean*||Evaluates to true
false|*boolean*||Evaluates to false
text|*string*|<ul><li>Value *literal*</li></ul>|Evaluates to a string
number|*number*|<ul><li>Value *literal*</li></ul>|Evaluates to a number
randomNumber|*number*|<ul><li>Min *number*</li><li>Max *number*</li></ul>|Evaluates to a random integer in range \<min, max>
+|*number*|<ul><li>Operand A *number*</li><li>Operand B *number*</li></ul>|Evaluates to the sum of its operands
*|*number*|<ul><li>Operand A *number*</li><li>Operand B *number*</li></ul>|Evaluates to the product of its operands
/|*number*|<ul><li>Operand A *number*</li><li>Operand B *number*</li></ul>|Evaluates to the quotient of its operands
-|*number*|<ul><li>Operand A *number*</li><li>Operand B *number*</li></ul>|Evaluates to the difference of its operands
&gt;|*boolean*|<ul><li>Operand A *number*</li><li>Operand B *number*</li></ul>|Evaluates to true if Operand A is greater than Operand B
&lt;|*boolean*|<ul><li>Operand A *number*</li><li>Operand B *number*</li></ul>|Evaluates to true if Operand A is lesser than Operand B
=|*boolean*|<ul><li>Operand A *number*</li><li>Operand B *number*</li></ul>|Evaluates to true if Operand A is equal to Operand B
getX|*number*|<ul><li>Entity *entityfilter*</li></ul>|Evaluates to x-axis position of the first entity in argument
getY|*number*|<ul><li>Entity *entityfilter*</li></ul>|Evaluates to y-axis position of the first entity in argument
velocityX|*number*|<ul><li>Entity *entityfilter*</li></ul>|Evaluates to x-axis velocity of the first entity in argument
velocityX|*number*|<ul><li>Entity *entityfilter*</li></ul>|Evaluates to y-axis velocity of the first entity in argument
getGravityX|*number*||Evaluates to x-axis strength of the world's gravity
getGravityY|*number*||Evaluates to y-axis strength of the world's gravity
isTouching|*boolean*|<ul><li>Entity filter A *entityfilter*</li><li>Entity filter B *number*</li></ul>|Evaluates to true if any of the entities from Entity filter A are touching any of the entities from Entity filter B
countEntities|*number*|<ul><li>Entity filter *entityfilter*</li></ul>|Evaluates to the number of entities in Entity filter
isButtonDown|*boolean*|<ul><li>Keycode *number*</li></ul>|Evaluates to true if the specified button is currently pressed
isButtonUp|*boolean*|<ul><li>Keycode *number*</li></ul>|Evaluates to true if the specified button has been released

You can use [keycode.info](http://keycode.info/) to find keycodes of buttons.

### Entity filters

All entity filters are of type *entityfilter*. All entity filters except `thisEntity`, `allEntities` and `filterById` take an *entityfiler* as the first argument, which they then filter further.

Name|Arguments|Description
----|---------|-----------
thisEntity||Contains the entity owning the behavior
allEntities||Contains all entities in the scene
filterById|<ul><li>ID *string*</li></ul>|Contains an entity with the specified ID
filterByGroup|<ul><li>Filter *entityfilter*</li><li>Collision group *number*</li></ul>|Contains all entities from Filter that belong to the specified collision group
filterByLayer|<ul><li>Filter *entityfilter*</li><li>Layer *number*</li></ul>|Contains all entities from Filter that belong to the specified layer
filterByContactWith|<ul><li>Filter *entityfilter*</li><li>Entities *entityfilter*</li></ul>|Contains all entities from Filter that are touching any of the entities in Entities

### Actions

Actions are executed when their behavior's condition is fulfilled. All actions are of type *action*.

Name|Arguments|Description
----|---------|-----------
setColor|<ul><li>Entities *entityfilter*</li><li>Color *string*</li></ul>|Sets the color to CSS color Color for all Entities
remove|<ul><li>Entities *entityfilter*</li></ul>|Removes all Entities
setGravity|<ul><li>X *number*</li><li>Y *number*</li></ul>|Sets the world's gravity
setPosition|<ul><li>Entities *entityfilter*</li><li>X *number*</li><li>Y *number*</li></ul>|Sets the position for all Entities
setAngularVelocity|<ul><li>Entities *entityfilter*</li><li>Strength *number*</li></ul>|Sets the angular velocity for all Entities
setLinearVelocity|<ul><li>Entities *entityfilter*</li><li>X *number*</li><li>Y *number*</li></ul>|Sets the linear velocity for all Entities
applyTorque|<ul><li>Entities *entityfilter*</li><li>Strength *number*</li></ul>|Applies angular force to all Entities
applyLinearForce|<ul><li>Entities *entityfilter*</li><li>X strength *number*</li><li>Y strength *number*</li></ul>|Applies a linear force to all entities
applyAngularImpulse|<ul><li>Entities *entityfilter*</li><li>Strength *number*</li></ul>|Applies an angular impulse to all entities
applyLinearImpulse|<ul><li>Entities *entityfilter*</li><li>X strength *number*</li><li>Y strength *number*</li></ul>|Applies a linear impulse to all entities

