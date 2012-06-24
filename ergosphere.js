//Test functions

//Convert ASCII art to a 2D array
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
					tile.pos(iy,ix);
					break;
				case "#":
					tile = new Wall;
					tile.pos(iy,ix);
					break;
				case "@":
					tile = new Empty;
					tile.pos(iy,ix);
					tile.contents = new Agent;
					break;
				default:
					tile = new Empty;
					tile.pos(iy,ix);
					console.log("AsciiArtToMap error");
					break;
			}
			mapRowArray.push(tile);
		}
		mapColumnArray.push(mapRowArray);
	}
	return mapColumnArray;
}

//Convert a 2D array to a human readable ASCII map
function MapToAsciiArt(map)
{
	var mapColumnString = [];
	for (var iy = 0; iy < map.length; iy++)
	{
		var mapRowString = [];
		for (var ix = 0; ix < map[iy].length; ix++)
		{
			var contents;
			switch (map[iy][ix])
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
					console.log("MapToAsciiArt error");
					break;
			}
			mapRowString.push(contents);
		}
		mapRowString.push("\n");
		mapRowString = mapRowString.join("")
		mapColumnString.push(mapRowString);
	}
	console.log(mapColumnString.join(""));
}

//A small map for dev use
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
	"#######################",
	];
	var start = {x:1, y:2};
	var end = {x:8, y:5};
	return {map:map, start:start, end:end};
}


//Initialize

var Agents = [];
var ConstructionSites = [];

//The parent class for any object that is displayed on the main screen
function MapObject()
{
	this.contents = [];
	this.effect = null;
}
MapObject.prototype.pos = function(y, x)
{
	this.pos = 
	{
		y: y,
		x: x,
	}
}

//An object representing a floor, and nothing else
function Empty()
{
	MapObject.call(this)
}
Empty.prototype = new MapObject();
Empty.prototype.constructor = Empty;
Empty.prototype.appearance = "empty";
Empty.prototype.type = Empty;
Empty.prototype.walkable = true;
Empty.prototype.placeOn = true;
Empty.prototype.description = "empty space";
Empty.prototype.workUnitsToBuild = 500; 

//An object representing a modular wall section
function Wall()
{
	MapObject.call(this)
}
Wall.prototype = new MapObject();
Wall.prototype.constructor = Wall;
Wall.prototype.appearance = "wall";
Wall.prototype.type = Wall;
Wall.prototype.walkable = false;
Wall.prototype.description = "wall";
Wall.prototype.workUnitsToBuild = 500;

//A basic creature
function Agent()
{
	MapObject.call(this);
	this.moveTo = null;
}
Agent.prototype = new MapObject();
Agent.prototype.constructor = Agent;
Agent.prototype.appearance = "agent";
Agent.prototype.type = Agent;
Agent.prototype.selectable = true;
Agent.prototype.selected = false;
Agent.prototype.dynamicTracking = Agents;
Agent.prototype.description = "sandwich maker";
Agent.prototype.build = null;
Agent.prototype.onDelete = function()
{
	RemoveObjectFromArray(this, Agents);
	this.build.builder = null;
}
Agent.prototype.moveOneTile = function()
{
	var path = Pathflinder(Map,this.pos,this.moveTo);
	if (path) 
	{
		this.pos = DrawPath(path,Map,this.pos,this);
	}
}
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
	//If there are valid build positions, find the closest, unoccupied one and set it as the destination
	if (destinationArray.length > 0)
	{
		SortEndPositions(Map, this.pos, destinationArray);
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
	//If the agent is at the build position, add work units to the construction
	if (buildPos && (buildPos.y == this.pos.y) && (buildPos.x == this.pos.x))
	{
		this.build.currWorkUnits += 10;
	}
}
Agent.prototype.tick = function()
{
	//debug
	if (Map[this.pos.y][this.pos.x].type == UnderConstruction) console.log("Agent overlap @",this.pos.y,this.pos.x,"moveTo:",this.moveTo,"buildPos:",this.buildPos);
	//If agent has a destination, path to the destination
	if (this.moveTo && ((this.pos.y != this.moveTo.y) || (this.pos.x != this.moveTo.x)))
	{
		this.moveOneTile();
	}
	//If agent has no destination and there is another agent on the same tile, move in a random, walkable, unoccupied directione
	else
	{
		this.unstack();
	}
	//If agent has nothing to build and there is something to build in the build queue
	if (!this.build && ConstructionSites.length > 0)
	{
		//Check that everything in the build queue has a builder assigned
		for (var i = 0; i < ConstructionSites.length; i++)
		{
			//If not
			if (!ConstructionSites[i].builder)
			{
				//Agent is assigned as builder
				ConstructionSites[i].builder = this;
			}
		}
	}
				/*
				//Check that the object under construction has a populated distance array
				if (ConstructionSites[i].distToAgents.length > 0)
				{
					for (var j =0; j < ConstructionSites[i].distToAgents.length; j++)
					{
						//If yes, check if agent is in the array
						if (ConstructionSites[i].distToAgents[j].agent == this)
						{
							if (dist < ConstructionSites[i].distToAgents[j].dist
				var path = Pathflinder(Map,this.pos,ConstructionSites[i].pos);
				//Check that a path exists to the object under construction
				if (path) 
				{
					var dist = path.length

					
					//If not, this agent is the only idle agent. Add it to the array and set it to work.


*/
	//If agent has something to build, determine position relative to object to be built and path there
	if (this.build)
	{
		this.moveToBuildSite();
	}
}

//An object representing a construction marker or a partially constructed object
function UnderConstruction()
{
	MapObject.call(this);
}
UnderConstruction.prototype = new MapObject();
UnderConstruction.prototype.constructor = UnderConstruction;
UnderConstruction.prototype.walkable = false;
UnderConstruction.prototype.type = UnderConstruction;
UnderConstruction.prototype.selectable = false;
UnderConstruction.prototype.dynamicTracking = ConstructionSites;
UnderConstruction.prototype.description = "something being built";
UnderConstruction.prototype.currWorkUnits = null; 
UnderConstruction.prototype.workUnitsToBuild = null; 
UnderConstruction.prototype.onCompletion = null; 
UnderConstruction.prototype.builder = null; 
UnderConstruction.prototype.distToAgents = DistanceToIdleAgents(this.pos);
UnderConstruction.prototype.onDelete = function()
{
	RemoveObjectFromArray(this, ConstructionSites);
	this.builder.build = null;
}
UnderConstruction.prototype.tick = function()
{
	if (this.currWorkUnits >= this.workUnitsToBuild)
	{
		MutateObject(this, this.onCompletion);
		//DeleteFromMap(this.pos.y, this.pos.x);
		//AddToMap(this.onCompletion, this.pos.y, this.pos.x);
		//Agents[0].build = null;
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
		if(this.builder && (this.builder.build != this))
		{
			this.builder.build = this
		}
		/*if (Agents.length > 0)
		{
			Agents[0].build = this;
		}*/
	}
}

var Picker = {};
var Delete = {};
var Inspector = {};
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
	select: Picker,
}

var DeleteSelector =
{
	appearance: "delete",
	select: Delete
}

var EmptySelector =
{
	appearance: "emptySelector",
	select: Empty
}
var InspectorSelector =
{
	appearance: "inspector",
	select: Inspector
}

//Initialize the palette with the following items
var PaletteItems = [AgentSelector, PickerSelector, InspectorSelector, DeleteSelector, WallSelector, EmptySelector];
//And set the default active palette item
var ActivePaletteItem = Agent;
	ActivePaletteItem.y = 0;

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
	var devMap = AsciiArtToMap(TestMap().map);
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
	if (ActivePaletteItem)
	{
		$(Palette[ActivePaletteItem.y]).addClass("paletteSelected");
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
			console.log("ReverseDir error");
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
		for (i = 0; i < dirs.length; i++)
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

//Takes a map, a starting position, and an array of end positions. Returns the array of reachable end positions sorted by distance.
function SortEndPositions(map, startPos, endPosArray)
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
				agent.pos(y, x);
				Map[y][x].contents.push(agent);
				Agents.push(agent);
			}
			break;
		default:
			{
				var object = new object;
				object.pos(y, x);
				Map[y][x] = object;
			}
	}
}

//Delete an object from the map
function DeleteFromMap(y, x)
{
	if (Map[y][x].contents.length > 0)
	{
		for (var i = 0; i < Map[y][x].contents.length; i++)
		{
			if (Map[y][x].contents[i].dynamicTracking)
			{
				UntrackDynamicObject(Map[y][x].contents[i]);
			}
		}
		Map[y][x].contents = [];
	}
	if (Map[y][x].dynamicTracking)
	{
		UntrackDynamicObject(Map[y][x]);
	}
	var empty = new Empty;
	empty.pos(y, x);
	Map[y][x] = empty;
}

//Mutate an object into another object
function MutateObject(oldObject, newObject)
{
	var mutated = new newObject;
	var y = oldObject.pos.y;
	var x = oldObject.pos.x;
	mutated.pos.y = y;
	mutated.pos.x = x;
	mutated.contents = oldObject.contents;
	if (oldObject.onDelete) oldObject.onDelete();
	Map[y][x] = mutated;
}

//If an object is being tracked i.e. it has a tick function, remove all references to that object
function UntrackDynamicObject(object)
{
	var dynamicArray = object.dynamicTracking;
	for (var i = 0; i < dynamicArray.length; i++)
	{
		if (object == dynamicArray[i])
		{
			if (i < (dynamicArray.length - 1))
			{
				dynamicArray[i] = dynamicArray[dynamicArray.length - 1];
			}
			dynamicArray.pop();	
		}
	}
	if (object.type == Agent && object.build && object.build.builder)
	{
		//debug
		console.log ("Agent deleted@",object.pos.y,object.pos.x,'buildPos:',object.buildPos,'moveTo:',object.moveTo)
		object.build.builder = null;
	}
}

//Instantiate a construction site object representing the object to be built
function BuildObject(object, y, x)
{
	var test = new object;
	if (Map[y][x].contents.length == 0 && (Map[y][x].type != test.type))
	{
		var constructionSite = new UnderConstruction;
		constructionSite.pos(y, x);
		constructionSite.currWorkUnits = 0;
		constructionSite.workUnitsToBuild = object.prototype.workUnitsToBuild;
		constructionSite.onCompletion = object;
		Map[y][x] = constructionSite;
		ConstructionSites.push(constructionSite);
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
		
//Calculate distance to all idle agents, to determine which to make the builder of an object
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
	switch (ActivePaletteItem)
	{
		case Picker:
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
		case Delete:
			DeleteFromMap(y, x);
			break;
		case Inspector:
			InspectMapTile(y, x);
			break;
		case Agent:
			AddToMap(ActivePaletteItem, y, x);
			break;
		default:
			BuildObject(ActivePaletteItem, y, x);
			break;
	}
}

//When a palette item is clicked, set a variable and draw selection effects
function SetActivePaletteItem(y)
{
	var previtem = ActivePaletteItem;
	previtem.y = ActivePaletteItem.y;
	ActivePaletteItem = PaletteItems[y].select;
	ActivePaletteItem.y = y;
	$(Palette[ActivePaletteItem.y]).addClass("paletteSelected");
	$(Palette[previtem.y]).removeClass("paletteSelected");
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
	for (var i = 0; i < Agents.length; i++)
	{
		Agents[i].tick();
	}
	for (var i = 0; i < ConstructionSites.length; i++)
	{
		ConstructionSites[i].tick();
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
