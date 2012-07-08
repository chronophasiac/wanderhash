//Test functions

/**
 * Convert ASCII art to a 2D array.
 * @param {Array.<string>} map strings representing the map
 * @return {Array.<Array.<MapObject>>} 2D array of MapObjects
 */
function AsciiArtToMap(map)
{
	var mapColumnArray = [];
	for (var iy = 0; iy < map.length; iy++)
	{
		var mapRowArray = [];
		for (var ix = 0; ix < map[iy].length; ix++)
		{
			var tile;
			switch (map[iy][ix])
			{
				case " ":
					tile = new Empty;
					tile.setPos(iy,ix);
					break;
				case "#":
					tile = new Wall;
					tile.setPos(iy,ix);
					break;
				case "@":
					tile = new Empty;
					tile.setPos(iy,ix);
					tile.contents = new Agent;
					break;
				default:
					throw Error("AsciiArtToMap error");
					break;
			}
			mapRowArray.push(tile);
		}
		mapColumnArray.push(mapRowArray);
	}
	return mapColumnArray;
}

/**
 * Convert a 2D array to a human readable ASCII map and print on the page
 * @param {Array.<Array.<MapObject>>} map  2D array of MapObjects
 */
function MapToAsciiArt(map)
{
	var mapColumnString = [];
	for (var iy = 0; iy < map.length; iy++)
	{
		var mapRowString = [];
		for (var ix = 0; ix < map[iy].length; ix++)
		{
			var contents;
			switch (map[iy][ix].type)
			{
				case Empty:
					contents = " ";
					break;
				case Wall:
					contents = "#";
					break;
				case Agent:
					contents = "@";
					break;
				default:
					contents = Empty;
					throw Error("MapToAsciiArt error");
					break;
			}
			mapRowString.push(contents);
		}
		mapRowString.push("\n");
		mapRowString = mapRowString.join("")
			mapColumnString.push(mapRowString);
	}
	$(TextBox).text(mapColumnString.join(""));
}

/**
 * A small map for dev use
 * @return {Array.<string>} map  strings representing the map
 */
function TestMap()
{
	var map = [
	"#######################",
	"# #     ######        #",
	"# # ###      #    #   #",
	"# # #   ######    #   #",
	"# # #  ##         #   #",
	"# # #  #          #   #",
	"# # #  ############   #",
	"# # #      #          #",
	"#   ######   #        #",
	"#######################"
	];
	return map;
}


//Initialize

/**
 * An array containing all Agents on the map
 * @type {Array.<Agent>}
 */
var Agents = [];

/**
 * An array containing all UnderConstructions on the map
 * @type {Array.<UnderConstruction>}
 */
var ConstructionSites = [];

/**
 * The parent class for any object that is displayed on the main screen
 * @constructor
 */
function MapObject()
{
	this.contents = [];
	this.effect = null;
}

/**
 * Sets the position of a MapObject
 * @param {number} y position on the y axis
 * @param {number} x position on the x axis
 */
MapObject.prototype.setPos = function(y, x)
{
	this.pos = 
	{
		y: y,
		x: x
	}
}

/**
 * An object representing a floor, and nothing else
 * @constructor
 */
function Empty()
{
	MapObject.call(this)
}
/**
 * Empty inherits from MapObject
 * @type {MapObject}
 */
Empty.prototype = new MapObject();
/**
 * Set constructor because of inheritence
 * @type {Empty}
 */
Empty.prototype.constructor = Empty;
/**
 * Name of CSS style to represent the tile
 * @type {string}
 */
Empty.prototype.appearance = "empty";
/**
 * Value used for flow control in other functions
 * @type {function()}
 */
Empty.prototype.type = Empty;
/**
 * Is object traversable?
 * @type {boolean}
 */
Empty.prototype.walkable = true;
/**
 * Can other map tiles be placed on object?
 * @type {boolean}
 */
Empty.prototype.placeOn = true;
/**
 * String for inspection tool
 * @type {string}
 */
Empty.prototype.description = "empty space";
/**
 * Cost of object
 * @type {number}
 */
Empty.prototype.workUnitsToBuild = 500; 

/**
 * An object representing a modular wall section
 * @constructor
 */
function Wall()
{
	MapObject.call(this)
}
/**
 * Wall inherits from MapObject
 * @type {MapObject}
 */
Wall.prototype = new MapObject();
/**
 * Set constructor because of inheritence
 * @type {Wall}
 */
Wall.prototype.constructor = Wall;
/**
 * Name of CSS style to represent the tile
 * @type {string}
 */
Wall.prototype.appearance = "wall";
/**
 * Value used for flow control in other functions
 * @type {function()}
 */
Wall.prototype.type = Wall;
/**
 * Is object traversable?
 * @type {boolean}
 */
Wall.prototype.walkable = false;
/**
 * String for inspection tool
 * @type {string}
 */
Wall.prototype.description = "wall";
/**
 * Cost of object
 * @type {number}
 */
Wall.prototype.workUnitsToBuild = 500;

/**
 * A basic creature
 * @constructor
 */
function Agent()
{
	MapObject.call(this);
	this.moveTo = null;
}
/**
 * Empty inherits from MapObject
 * @type {MapObject}
 */
Agent.prototype = new MapObject();
/**
 * Set constructor because of inheritence
 * @type {Agent}
 */
Agent.prototype.constructor = Agent;
/**
 * Name of CSS style to represent the tile
 * @type {string}
 */
Agent.prototype.appearance = "agent";
/**
 * Value used for flow control in other functions
 * @type {function()}
 */
Agent.prototype.type = Agent;
/**
 * Is object selectable?
 * @type {boolean}
 */
Agent.prototype.selectable = true;
/**
 * Is object selected?
 * @type {boolean}
 */
Agent.prototype.selected = false;
/**
 * String for inspection tool
 * @type {string}
 */
Agent.prototype.description = "sandwich maker";
/**
 * Object that agent is assigned to build, if any
 * @type {?MapObject}
 */
Agent.prototype.build = null;

/**
 * Removes all references to the Agent
 */
Agent.prototype.destroy = function()
{
	RemoveObjectFromArray(this, Agents);
	this.build = null;
}

/**
 * Moves the Agent object one tile towards moveTo
 */
Agent.prototype.moveOneTile = function()
{
	var path = Pathflinder(Map,this.pos,this.moveTo);
	if (path) 
	{
		this.pos = DrawPath(path,Map,this.pos,this);
	}
}

/**
 * Move the Agent one tile in a random direction if it is sharing the tile with another Agent
 */
Agent.prototype.unstack = function()
{
	var tileMates = Map[this.pos.y][this.pos.x].contents;
	if (tileMates && tileMates.length > 1 && tileMates[tileMates.length-1] == this)
	{
		var dirs = GetRandomDirs();
		for (var i = 0; i < dirs.length; i++)
		{
			var nextPos = DirectionToPosition(dirs[i], this.pos);
			var nextPosTile = Map[nextPos.y][nextPos.x]; 
			if (nextPosTile.walkable && nextPosTile.contents.length == 0)
			{
				this.moveTo = nextPos;
				break;
			}
		}
	}
}

/**
 * Find a tile for the Agent to build an object from, then set it as moveTo. If agent is in position to build, add workUnits to the UnderConstruction object.
 */
Agent.prototype.moveToBuildSite = function()
{
	//Accumulate an array of valid build positions
	var destinationArray = []
	for (var i = 0; i < AllDirs.length; i++)
	{
		var nextPos = DirectionToPosition(AllDirs[i], this.build.pos);
		var nextPosTile = Map[nextPos.y][nextPos.x]; 
		if (nextPosTile.walkable)
		{
			destinationArray.push({y: nextPos.y, x: nextPos.x});
		}
	}
	//Sort the build positions by distance
	if (destinationArray.length > 1)
	{
		destinationArray = SortPositionsByDistance(Map, this.pos, destinationArray);
	}
	//If there are valid build positions, find the closest, unoccupied one and set it as the destination
	if (destinationArray.length > 0)
	{
		for (var i = 0; i < destinationArray.length; i++)
		{
			if (IsTileVacant(destinationArray[i], this, Agent))
			{
				var buildPos = destinationArray[i];
				break;
			}
		}
		if (!buildPos)
		{
			var buildPos = destinationArray[0];
		}
		this.moveTo = buildPos;
	}
	//If there are no valid build positions, remove agent as the builder
	else 
	{
		this.build = null;
		this.moveTo = null;
	}
	//If the agent is at the build position, add work units to the construction
	if (buildPos && (buildPos.y == this.pos.y) && (buildPos.x == this.pos.x))
	{
		this.build.currWorkUnits += 10;
	}
}

/**
 * Move agent randomly if idle
 */
Agent.prototype.wander = function()
{
	var rand = Math.random();
	if ((rand > .96) && (rand < .999))
	{
		//wander close
		var dirs = GetRandomDirs();
		for (var i = 0; i < dirs.length; i++)
		{
			var moreDirs = GetRandomDirs();
			for (var j = 0; j < dirs.length; j++)
			{
				var wanderPos = DirectionToPosition(moreDirs[j], DirectionToPosition(dirs[i], this.pos));
				if (MapBoundsCheck(wanderPos) && Map[wanderPos.y][wanderPos.x].walkable)
				{
					this.moveTo = wanderPos;
					break;
				}
			if (this.moveTo) break;
			}
		}
	}
	//TODO
	/*if (rand > .999)
	{
		//wander far
	}
	*/
}

/**
 * Executes all Agent behaviors
 */
Agent.prototype.tick = function()
{
	//If agent has something to build, determine target position relative to object to be built and path there
	if (this.build)
	{
		this.moveToBuildSite();
	}
	//If agent has a destination, path to the destination
	if (this.moveTo && ((this.pos.y != this.moveTo.y) || (this.pos.x != this.moveTo.x)))
	{
		this.moveOneTile();
	}
	//If agent has nothing to build and there is something to build in the build queue
	else if (!this.build && ConstructionSites.length > 0)
	{
		var sites = [];
		//Check that something in the build queue has a builder assigned
		for (var i = 0; i < ConstructionSites.length; i++)
		{
			//If there is no assigned builder, accumulate an array of construction sites
			var hasBuilder = false;
			for (var j = 0; j < Agents.length; j++)
			{
				if (Agents[j].build == ConstructionSites[i])
				{
					hasBuilder = true;
					break;
				}
			}
			if (!hasBuilder)
			{
				sites.push(ConstructionSites[i].pos)
			}
		}
		//If there is an array of construction sites, sort it by distance and assign the agent to the closest site
		if (sites.length > 0)
		{
			if (sites.length == 1)
			{
				this.build = Map[sites[0].y][sites[0].x];
			}
			else
			{
				SortPositionsByDistance(Map, this.pos, sites);
				this.build = Map[sites[0].y][sites[0].x];
			}
		}
	}
	//If agent has no destination and there is another agent on the same tile, move in a random, walkable, unoccupied directione
	else
	{
		this.unstack();
	}
	if (this.moveTo && ((this.pos.y == this.moveTo.y) && (this.pos.x == this.moveTo.x)))
	{
		this.moveTo = null;
	}
	if (!this.moveTo)
	{
		this.wander();
	}
}

/**
 * An object representing a construction marker or a partially constructed object
 * @constructor
 */
function UnderConstruction()
{
	MapObject.call(this);
}
/**
 * UnderConstruction inherits from MapObject
 * @type {MapObject}
 */
UnderConstruction.prototype = new MapObject();
/**
 * Set constructor because of inheritence
 * @type {UnderConstruction}
 */
UnderConstruction.prototype.constructor = UnderConstruction;
/**
 * Is object traversable?
 * @type {boolean}
 */
UnderConstruction.prototype.walkable = false;
/**
 * Value used for flow control in other functions
 * @type {function()}
 */
UnderConstruction.prototype.type = UnderConstruction;
/**
 * Is object selectable?
 * @type {boolean}
 */
UnderConstruction.prototype.selectable = false;
/**
 * String for inspection tool
 * @type {string}
 */
UnderConstruction.prototype.description = "something being built";
/**
 * Tracks progression of object under construction
 * @type {?number}
 */
UnderConstruction.prototype.currWorkUnits = null; 
/**
 * Cost of object
 * @type {?number}
 */
UnderConstruction.prototype.workUnitsToBuild = null; 
/**
 * The result of a successful construction
 * @type {?MapObject}
 */
UnderConstruction.prototype.onCompletion = null; 

/**
 * Add the UnderConstruction object to the array of all such objects
 */
UnderConstruction.prototype.init = function()
{
	ConstructionSites.push(this);
}

/**
 * Remove all references to the UnderConstruction object.
 */
UnderConstruction.prototype.destroy = function()
{
	RemoveObjectFromArray(this, ConstructionSites);
	//Remove construction site from agent build assignments
	for (var i = 0; i < Agents.length; i++)
	{
		if (Agents[i].build == this)
		{
			Agents[i].build = null;
		}
	}
}

/**
 * Execute all UnderConstruction behavior
 */
UnderConstruction.prototype.tick = function()
{
	if (this.currWorkUnits >= this.workUnitsToBuild)
	{
		MutateMapObject(this, this.onCompletion);
	}
	else
	{
		var percentDone = (this.currWorkUnits / this.workUnitsToBuild) * 100;
		if (percentDone === 0)
		{
			this.effect = "markedForConstruction";
		}
		else if (percentDone <= 25)
		{
			this.effect = "oneFourthConstructed";
		}
		else if ((percentDone > 25) && (percentDone <= 50))
		{
			this.effect = "oneHalfConstructed";
		}
		else if ((percentDone > 50) && (percentDone <= 75))
		{
			this.effect = "threeFourthsConstructed";
		}
		else if (percentDone > 75)
		{
			this.effect = "almostConstructed";
		}
	}
}

/**
 * Tool states for map interactions
 * @enum {number}
 */
var Tool = 
{
	picker: 0,
	deleter: 1,
	inspector: 2
}
var WallSelector =
{
	appearance: "wall",
	select: Wall
}

//Selectors used by the palette
var AgentSelector =
{
	appearance: "agent",
	select: Agent
}

var PickerSelector =
{
	appearance: "picker",
	select: Tool.picker
}

var DeleteSelector =
{
	appearance: "delete",
	select: Tool.deleter
}

var EmptySelector =
{
	appearance: "emptySelector",
	select: Empty
}
var InspectorSelector =
{
	appearance: "inspector",
	select: Tool.inspector
}

//Initialize the palette with the following items
var PaletteItems = [AgentSelector, PickerSelector, InspectorSelector, DeleteSelector, WallSelector, EmptySelector];
//And set the default active palette item
var ActivePaletteItem = 0;

var SelectedObject =
{
	curr: null,
	prev: null
}

var AllDirs = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"];

var Map = [];
var Screen = [];
var Palette = [];
var TextBox = null;

//Initialize the map, representing the entire game universe
function InitMap()
{
	var devMap = AsciiArtToMap(TestMap());
	for(var iy = 0; iy < devMap.length; iy++)
	{
		var mapColumnArray = []
		for(var ix = 0; ix < devMap[iy].length; ix++)
		{
			mapColumnArray.push(devMap[iy][ix]);
		}
		Map.push(mapColumnArray)
	}
}

//Initialize the main screen, a view on the map
function InitScreen()
{
	for(var iy = 0; iy < Map.length; iy++)
	{
		var mapRow = $('<div class="mapRow"></div>', mapPos);
		var mapPos = $("#Map");
		mapRow.appendTo(mapPos)
		var mapColumnArray = []
		for(var ix = 0; ix < Map[iy].length; ix++)
		{
			var mapColumn = $('<div class="mapColumn"</div>', mapRow);
			(function(iy, ix) {
				mapColumn.mousedown(function(event)
				{
					MapInteract(iy, ix);
				})
			})(iy, ix);
			mapColumn.appendTo(mapRow);
			mapColumnArray.push(mapColumn);
		}
		Screen.push(mapColumnArray);
	}
}

//Initialize a palette to select how to interact with the main screen
function InitPalette()
{
	for (var iy = 0; iy < PaletteItems.length; iy++)
	{
		var paletteRow = $('<div class="paletteRow"></div>');
		var palettePos = $("#Palette");
		paletteRow.appendTo(palettePos);
		(function(iy) {
			paletteRow.mousedown(function(event)
				{
					SetActivePaletteItem(iy);
				})
		})(iy);
		$(paletteRow).addClass(PaletteItems[iy].appearance);
		Palette.push(paletteRow);
	}
	if (ActivePaletteItem != null)
	{
		$(Palette[ActivePaletteItem]).addClass("paletteSelected");
	}
}

//Initialize the text box which provides textual feedback
function InitTextBox()
{
	TextBox = $('<div class="textRow"></div>');
	var textBoxPos = $("#TextBox");
	TextBox.appendTo(textBoxPos);
}


//Pathfinding functions

//Used by the sorting function to keep the frontier sorted
function CompareDist(a,b)
{
	return a.dist - b.dist;
}

//Convert an English word into coordinate differentials on the y axis
function Getdy(dirname)
{
	switch (dirname)
	{
		case "east":
		case "west":
			return 0;
		case "north":
		case "northeast":
		case "northwest":
			return -1;
		case "south":
		case "southeast":
		case "southwest":
			return 1;
	}
}

//Convert an English word into coordinate differentials on the x axis
function Getdx(dirname)
{
	switch (dirname)
	{
		case "north":
		case "south":
			return 0;
		case "northeast":
		case "east":
		case "southeast":
			return 1;
		case "southwest":
		case "west":
		case "northwest":
			return -1;
	}
}

//Return the opposite direction for an English direction
function ReverseDir(dirname)
{
	switch (dirname)
	{
		case "north":
			return "south";
		case "northeast":
			return "southwest";
		case "east":
			return "west";
		case "southeast":
			return "northwest";
		case "south":
			return "north";
		case "southwest":
			return "northeast";
		case "west":
			return "east";
		case "northwest":
			return "southeast";
		default:
			throw Error("ReverseDir error");
			break;
	}
}

//Returns an array of randomized directions
function GetRandomDirs()
{
	var dirs = [];
	var randomDirs = [];
	for (var i = 0; i < AllDirs.length; i++)
	{
		dirs.push(AllDirs[i]);
	}
	for (var i = 0; i < AllDirs.length; i++)
	{
		var diceRoll = Math.round(Math.random()*(dirs.length - 1));
		randomDirs.push(dirs[diceRoll]);
		if (diceRoll < dirs.length)
		{
			 dirs[diceRoll] = dirs[dirs.length - 1];
		}
		dirs.pop();
	}
	return randomDirs;
}

//Return the x and y value for a position when it is transformed by a direction
function DirectionToPosition(dir, pos)
{
	var dy = Getdy(dir);
	var dx = Getdx(dir);
	var nextPos = {y: pos.y + dy, x: pos.x + dx};
	return nextPos;
}

//For a position, return true if the position is inside the map
function MapBoundsCheck(pos)
{
	try 
	{
		if ((pos.y < 0) || (pos.y > (Map.length - 1))) return false;
		if ((pos.x < 0) || (pos.x > (Map[pos.y].length - 1))) return false;
	}
	catch (e)
	{
		throw new Error("Error in map bounds check");
	}
	return true;
}

//For a map, return an array of directions representing a path from start to end. If no path, return false.
function Pathflinder(originalMap,start,end)
{
	var map = [];
	for (var iy = 0; iy < originalMap.length; iy++)
	{
		map.push({});
	}
	map[start.y][start.x] = 0;
	var frontier = [{dist: 0, x: start.x, y: start.y}];
	while (frontier.length > 0)
	{
		var dirs = GetRandomDirs();
		for (var i = 0; i < dirs.length; i++)
		{
			var dy = Getdy(dirs[i]);
			var dx = Getdx(dirs[i]);
			var visited = {dist: (map[frontier[0].y][frontier[0].x]) + 1, x:frontier[0].x + dx, y:frontier[0].y + dy};
			if ((visited.y >= 0) && (visited.y < originalMap.length)
					&& (visited.x >= 0) && (visited.x < originalMap[visited.y].length))
			{
				var visitedContents = originalMap[frontier[0].y + dy][frontier[0].x + dx];
				if (originalMap[frontier[0].y + dy][frontier[0].x + dx].walkable
						&& typeof map[frontier[0].y + dy][frontier[0].x + dx] == "undefined") 
				{
					map[visited.y][visited.x] = visited.dist;
					frontier.push(visited);
				}
			}
		}
		frontier.shift();
		frontier.sort(CompareDist);
	}
	if (typeof map[end.y][end.x] == "undefined") return false;
	var pos = end;
	var path = [];
	while (map[pos.y][pos.x] != 0)
	{
		var dirs = GetRandomDirs();
		for (i = 0; i < dirs.length; i++)
		{
			var nextPos = DirectionToPosition(dirs[i], pos);
			var nextPosTile = map[nextPos.y][nextPos.x]; 
			if ((typeof nextPosTile != "undefined") && (nextPosTile < map[pos.y][pos.x]))
			{
				path.push(ReverseDir(dirs[i]));
				pos = nextPos;
				break;
			}
		}
	}
	path = path.reverse();
	return path;
}

//Takes a map, a starting position, and an array of end positions. 
//Returns an array of reachable end positions and the distance to each position
function SortPositionsByDistance(map, startPos, endPosArray)
{
	for (var i = 0; i < endPosArray.length; i++)
	{
		var path = Pathflinder(map,startPos,endPosArray[i]);
		if (path)
		{
			endPosArray[i].dist = path.length
		}
		else
		{
			RemoveObjectFromArray(endPosArray[i], endPosArray)
		}
	}
	endPosArray.sort(CompareDist);
	return endPosArray
}


//Game functions

//Locates object in an array, and removes it
function RemoveObjectFromArray(object, array)
{
	for (var i = 0; i < array.length; i++)
	{
		if (object === array[i])
		{
			if (i < (array.length - 1))
			{
				array[i] = array[array.length - 1];
			}
			array.pop();	
		}
	}
}

//Add an object to the map
function AddToMap(object, y, x)
{
	switch (object)
	{
		case Agent:
			if (Map[y][x].placeOn && Map[y][x].contents.length == 0) 
			{
				var agent = new Agent;
				agent.setPos(y, x);
				Map[y][x].contents.push(agent);
				Agents.push(agent);
			}
			break;
		default:
			{
				var object = new object;
				object.setPos(y, x);
				Map[y][x] = object;
			}
	}
}

//Clear objects from a map tile
function ClearMapTile(y, x)
{
	if (Map[y][x].contents.length > 0)
	{
		for (var i = 0; i < Map[y][x].contents.length; i++)
		{
			if (Map[y][x].contents[i].destroy)
			{
				Map[y][x].contents[i].destroy();
			}
		}
		Map[y][x].contents = [];
	}
	if (Map[y][x].destroy)
	{
		Map[y][x].destroy();
	}
	var empty = new Empty;
	empty.setPos(y, x);
	Map[y][x] = empty;
}

//Mutate an object into another object
function MutateMapObject(oldObject, newObject)
{
	var mutated = new newObject;
	var y = oldObject.pos.y;
	var x = oldObject.pos.x;
	mutated.setPos(y, x);
	mutated.contents = oldObject.contents;
	if (oldObject.destroy) oldObject.destroy();
	Map[y][x] = mutated;
}

//Instantiate a construction site object representing the object to be built
function BuildObject(object, y, x)
{
	var test = new object;
	if (Map[y][x].contents.length == 0 && (Map[y][x].type != test.type))
	{
		var constructionSite = new UnderConstruction;
		constructionSite.setPos(y, x);
		constructionSite.currWorkUnits = 0;
		constructionSite.workUnitsToBuild = object.prototype.workUnitsToBuild;
		constructionSite.onCompletion = object;
		constructionSite.init();
		Map[y][x] = constructionSite;
	}
}

//Takes a location and an object, and returns true if there are no check objects at the location, or if and only if the object is at the location. Returns false otherwise.
function IsTileVacant(loc, thisObject, checkObject)
{
	var tile = Map[loc.y][loc.x];
	if (tile.contents.length == 0) return true;
	for (var i = 0; i < tile.contents.length; i++)
	{
		if ((tile.contents[i].type == checkObject) && (tile.contents[i] != thisObject)) return false;
	}
	return true;
}
		
//NOT USED: Calculate distance to all idle agents, to determine which to make the builder of an object
function DistanceToIdleAgents(pos)
{
	var distances = [];
	for (var i = 0; i < Agents.length; i++)
	{
		if (!Agents[i].build)
		{
			var path = Pathflinder(Map, pos, Agents[i].pos);
			if (path)
			{
				distances.push({agent: Agent[i], dist: path.length});
			}
		}
	}
	return distances;
}

//Display the description for objects on a map tile
function InspectMapTile(y, x)
{
	if (Map[y][x].contents.length > 0)
	{
		var tileStuff = ["Here are: " + Map[y][x].description];
		for (var i = 0; i < Map[y][x].contents.length; i++)
		{
			tileStuff.push(Map[y][x].contents[i].description);
		}
		tileStuff = tileStuff.join(", ");
	}
	else
	{
		var tileStuff = "Here is: " + Map[y][x].description;
	}
	$(TextBox).text(tileStuff);
}

//Depending on what palette item is active, apply various effects to the map when clicked
function MapInteract(y, x)
{
	switch (PaletteItems[ActivePaletteItem].select)
	{
		case Tool.picker:
			if (Map[y][x].contents.length >= 1)
			{
				if (SelectedObject.curr)
				{
					SelectedObject.prev = SelectedObject.curr;
					SelectedObject.prev.selected = false;
				}
				var lastelement = Map[y][x].contents.length - 1;
				SelectedObject.curr = Map[y][x].contents[lastelement];
				SelectedObject.curr.selected = true;
			}
			if ((Map[y][x].contents.length == 0) && SelectedObject.curr)
			{
				SelectedObject.curr.moveTo = {y: y, x: x};
			}
			break;
		case Tool.deleter:
			ClearMapTile(y, x);
			break;
		case Tool.inspector:
			InspectMapTile(y, x);
			break;
		case Agent:
			AddToMap(Agent, y, x);
			break;
		case Wall:
			BuildObject(Wall, y, x);
			break;
		case Empty:
			BuildObject(Empty, y, x);
			break;
		default:
				throw Error("Error in MapInteract");
	}
}

//When a palette item is clicked, set a variable and draw selection effects
function SetActivePaletteItem(y)
{
	var previtem = ActivePaletteItem;
	ActivePaletteItem = y;
	$(Palette[ActivePaletteItem]).addClass("paletteSelected");
	$(Palette[previtem]).removeClass("paletteSelected");
}

//On the map, draw one step from the path
function DrawPath(path,map,pos,agent)
{
	var nextPos = DirectionToPosition(path[0], pos);
	map[nextPos.y][nextPos.x].contents.push(agent);
	map[pos.y][pos.x].contents.pop();
	return nextPos;
}

//Draw graphics on the screen
function UpdateScreen()
{
	for(var iy = 0; iy < Map.length; iy++)
	{
		for(var ix = 0; ix < Map[iy].length; ix++)
		{
			DrawTile(Screen[iy][ix], Map[iy][ix])
		}
	}
}

//Get class names from map coordinates and apply them to screen coordinates
function DrawTile(screenPos, mapTile)
{
	var screenPosClasses = $(screenPos).attr("class").split(" ");
	var mapTileClasses = ["mapColumn"];
	mapTileClasses.push(mapTile.appearance);
	if (mapTile.effect)
	{
		mapTileClasses.push(mapTile.effect);
	}
	if (mapTile.contents && (mapTile.contents.length >= 1)) 
	{
		mapTileClasses.push(mapTile.contents[0].appearance);
		for (var i = 0; i < mapTile.contents.length; i++)
		{
			if (mapTile.contents[i].selected)
			{
				mapTileClasses.push("mapSelected");
			}
		}
	}
	if (mapTileClasses.length != screenPosClasses.length)
	{
		$(screenPos).removeClass();
		$(screenPos).addClass(mapTileClasses.join(" "));
	}
	else
	{
		for (var i = 0; i < mapTileClasses.length; i ++)
		{
			if (mapTileClasses[i] != screenPosClasses[i])
			{
				$(screenPos).removeClass();
				$(screenPos).addClass(mapTileClasses.join(" "));
				break;
			}
		}
	}
}

//Execute all dynamic object functions
function RunFrame()
{
	for (var i = 0; i < ConstructionSites.length; i++)
	{
		ConstructionSites[i].tick();
	}
	for (var i = 0; i < Agents.length; i++)
	{
		Agents[i].tick();
	}
}

//The event loop
function Tick()
{
	RunFrame();
	UpdateScreen();
	setTimeout(Tick,100);
}


InitMap();
InitScreen();
InitPalette();
InitTextBox();
Tick();
