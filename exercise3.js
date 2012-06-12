//Test functions
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
					break;
				case "#":
					tile = new Wall;
					break;
				case "@":
					tile = new Empty;
					tile.contents = new Agent;
					break;
				default:
					tile = new Empty;
					console.log("AsciiArtToMap error");
					break;
			}
			mapRowArray.push(tile);
		}
		mapColumnArray.push(mapRowArray);
	}
	return mapColumnArray;
}

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

function CompareDist(a,b)
{
	return a.dist - b.dist;
}


//Pathfinding functions
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
			var dx = Getdx(dirs[i]);
			var dy = Getdy(dirs[i]);
			var visited = {dist: (map[frontier[0].y][frontier[0].x]) + 1, x:frontier[0].x + dx, y:frontier[0].y + dy};
			var visitedContents = originalMap[frontier[0].y + dy][frontier[0].x + dx];
			if ((visited.x >= 0) && (visited.y <= originalMap.length)
					&& (visited.y >= 0) && (visited.x <= originalMap[0].length)
					&& originalMap[frontier[0].y + dy][frontier[0].x + dx].walkable
					&& typeof map[frontier[0].y + dy][frontier[0].x + dx] == "undefined") 
			{
				map[visited.y][visited.x] = visited.dist;
				frontier.push(visited);
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
			var dx = Getdx(dirs[i]);
			var dy = Getdy(dirs[i]);
			var nextPos = {x: pos.x + dx, y: pos.y + dy};
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


//Initialize
var Empty = function()
{
	this.contents = [];
}

Empty.prototype.appearance = "empty";
Empty.prototype.walkable = true;
Empty.prototype.placeOn = true;

var Wall = function ()
{
	this.contents = [];
}

Wall.prototype.appearance = "wall";
Wall.prototype.walkable = false;

var Agent = function(y,x)
{
	this.moveto = null;
	this.pos = 
	{
		x: x,
		y: y
	}
}

Agent.prototype.appearance = "agent";
Agent.prototype.type = Agent;
Agent.prototype.selectable = true;
Agent.prototype.selected = false;
Agent.prototype.dynamic = true;
Agent.prototype.tick = function()
{
	if (this.moveto && ((this.pos.y != this.moveto.y) || (this.pos.x != this.moveto.x)))
	{
		var path = Pathflinder(Map,this.pos,this.moveto);
		if (path) 
		{
			this.pos = DrawPath(path,Map,this.pos,this);
		}
	}
	else
	{
		var tileMates = Map[this.pos.y][this.pos.x].contents;
		if (tileMates && tileMates.length > 1 && tileMates[tileMates.length-1] == this)
		{
			var dirs = GetRandomDirs();
			for (var i = 0; i < dirs.length; i++)
			{
				var dx = Getdx(dirs[i]);
				var dy = Getdy(dirs[i]);
				var nextPos = {x: this.pos.x + dx, y: this.pos.y + dy};
				var nextPosTile = Map[nextPos.y][nextPos.x]; 
				if (nextPosTile.walkable && nextPosTile.contents.length == 0)
				{
					this.moveto = nextPos;
					break;
				}
			}
		}
	}
}

var Picker =
{
}

var Delete =
{
}

var WallSelector =
{
	appearance: "wall",
	select: Wall
}

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

var PaletteItems = [PickerSelector, WallSelector, AgentSelector, DeleteSelector];

var Map = [];

var Screen = [];

var Palette = [];

var ActivePaletteItem = Agent;
ActivePaletteItem.y = 2;

var SelectedObject =
{
	curr: null,
	prev: null
}

var DynamicObjects = [];

var AllDirs = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"];

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
			(function(ix, iy) {
				mapColumn.mousedown(function(event)
				{
					MapInteract(ix, iy);
				})
			})(ix, iy);
			mapColumn.appendTo(mapRow);
			mapColumnArray.push(mapColumn);
		}
		Screen.push(mapColumnArray);
	}
}

function AddToMap(object, x, y)
{
	switch (object)
	{
		case Agent:
			if (Map[y][x].placeOn && Map[y][x].contents.length == 0) 
			{
				var agent = new Agent(y,x);
				Map[y][x].contents.push(agent);
				DynamicObjects.push(agent);
			}
			break;
		default:
			if (Map[y][x].placeOn)
			{
				Map[y][x] = new object;
			}
	}
}

function DeleteFromMap(x, y)
{
	if (Map[y][x].contents)
	{
		for (var i = 0; i < Map[y][x].contents.length; i++)
		{
			if (Map[y][x].contents[i].dynamic)
			{
				UntrackDynamicObject(Map[y][x].contents[i]);
			}
		}
	}
	Map[y][x] = new Empty;
}

function UntrackDynamicObject(object)
{
	for (var i = 0; i < DynamicObjects.length; i++)
	{
		if (object == DynamicObjects[i])
		{
			if (i < (DynamicObjects.length - 1))
			{
				DynamicObjects[i] = DynamicObjects[DynamicObjects.length - 1];
			}
			DynamicObjects.pop();	
		}
	}
}


function MapInteract(x, y)
{
	if (ActivePaletteItem == Picker)
	{
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
			SelectedObject.curr.moveto = {x: x, y: y};
		}
	}
	else if (ActivePaletteItem == Delete)
	{
		DeleteFromMap(x, y)
	}
	else
	{
		AddToMap(ActivePaletteItem, x, y)
	}
}

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

function SetActivePaletteItem(y)
{
	var previtem = ActivePaletteItem;
	previtem.y = ActivePaletteItem.y;
	ActivePaletteItem = PaletteItems[y].select;
	ActivePaletteItem.y = y;
	$(Palette[ActivePaletteItem.y]).addClass("paletteSelected");
	$(Palette[previtem.y]).removeClass("paletteSelected");
}


//Draw one step from the path
function DrawPath(path,map,pos,agent)
{
	var dx = Getdx(path[0]);
	var dy = Getdy(path[0]);
	var nextPos = {x: pos.x + dx, y: pos.y + dy};
	map[nextPos.y][nextPos.x].contents.push(agent);
	map[pos.y][pos.x].contents.pop();
	return nextPos;
}

/*Update the Screen with data from the Map, and draw graphics*/
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

/*Insert the graphics from map coordinates to screen coordinates*/
function DrawTile(screenPos, mapTile)
{
	var screenPosClasses = $(screenPos).attr("class").split(" ");
	var mapTileClasses = ["mapColumn"];
	mapTileClasses.push(mapTile.appearance);
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

//Get the path for the agents, then draw it.
function RunFrame()
{
	for (var i = 0; i < DynamicObjects.length; i++)
	{
		DynamicObjects[i].tick();
	}
}

function Tick()
{
	RunFrame();
	UpdateScreen();
	setTimeout(Tick,100);
}


InitMap();
InitScreen();
InitPalette();
Tick();
