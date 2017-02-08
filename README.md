# Scenária
## A JavaScript scene editor for Box2D with behavior programming
### The userguide

## Examples and links

First things first, here's a link to the newest depoloyed version of the editor: [https://jkbmat.github.io/bakalarska-praca-dist/](https://jkbmat.github.io/bakalarska-praca-dist/).

And here's some examples of Scenária in action:
* [Voleyball](https://jkbmat.github.io/bakalarska-praca-dist/#27fcde37-d8e0-40e2-bfe6-90c88689603c)
* [Pong](https://jkbmat.github.io/bakalarska-praca-dist/#ca279676-b8a2-48a4-b67c-30c1a59af6ed)
* [Weird Pong](https://jkbmat.github.io/bakalarska-praca-dist/#f9935f21-9b56-47e5-9797-f74c6a3afe1e) with dampened weld joints

## Quick glossary
* **Entity** is a combination of Box2D's body, shape and fixture. Scenária doesn't support entities with multiple shapes. The workaround for this issue is to use weld joints.
* **Joint** holds two entities together and defines their interaction

## The enviroment

Here's how the editor looks once it's freshly started:
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
  * **Collision groups button** sets which collision groups should and should not interact. More on this in section **Entities**.
  * **Tool buttons**
    * Select tool is used for selecting and repositioning entities and joints
    * Rectangle and circle tools are used for creating new entities with their respective shapes
  * **Joint buttons** are used for creating new joints. More on this in the section **Joints**
  * **Zoom slider** controls the zoom level of the enviroment
  * **Language chooser** allows changing the editor's language
    * Language files are located in the folder [/app/translations/](/app/translations/). Feel free to translate the editor to any language of your choice!
    
## World
If no joits or entities are selected, the contextual sidebar shows informations about the simulation world.
Here you can set the gravity vector and camera style.

Camera can be either:
* **Locked on point** (static)
* **Locked on entity** (always centered on an entity of your choice)

## Entities
To add a new entity to the simulation, simply choose a desired tool and create the entity in the work space using drag & drop. It will be assigned default attributes and a random color.
Each entity is assigned a layer and a collision group. Layers determine the order in which entities are drawn. Collision groups determine which entities should interact with which other entities.
The Collision groups window, accessible form the toolbar, is a place to define collision group interaction.

![Collision groups window](/readme-files/collision-groups.png)
Collision groups 2 and 3 will now no longer interact

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


