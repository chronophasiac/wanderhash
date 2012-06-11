//Test functions
function ascii_art_to_map(map)
{
	var columnarray = [];
	for (var iy = 0; iy < map.length; iy++)
	{
		var rowarray = [];
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
					console.log("ascii_art_to_map error");
					break;
			}
			rowarray.push(tile);
		}
		columnarray.push(rowarray);
	}
	return columnarray;
}

function map_to_ascii_art(map)
{
	var columnstring = [];
	for (var iy = 0; iy < map.length; iy++)
	{
		var rowstring = [];
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
					console.log("map_to_ascii_art error");
					break;
			}
			rowstring.push(contents);
		}
		rowstring.push("\n");
		rowstring = rowstring.join("")
		columnstring.push(rowstring);
	}
	console.log(columnstring.join(""));
}

function testmap()
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

function Pathflinder(orig_map,start,end)
{
	var map = [];
	for (var iy = 0; iy < orig_map.length; iy++)
	{
		map.push({});
	}
	map[start.y][start.x] = 0;
	var frontier = [{dist: 0, x: start.x, y: start.y}];
	var alldirs = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"];
	while (frontier.length > 0)
	{
		for (i = 0; i < alldirs.length; i++)
		{
			var dx = Getdx(alldirs[i]);
			var dy = Getdy(alldirs[i]);
			var visited = {dist: (map[frontier[0].y][frontier[0].x]) + 1, x:frontier[0].x + dx, y:frontier[0].y + dy};
			var visitedcontents = orig_map[frontier[0].y + dy][frontier[0].x + dx];
			if ((visited.x >= 0) && (visited.y <= orig_map.length)
					&& (visited.y >= 0) && (visited.x <= orig_map[0].length)
					&& orig_map[frontier[0].y + dy][frontier[0].x + dx].walkable
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
		for (i = 0; i < alldirs.length; i++)
		{
			var dx = Getdx(alldirs[i]);
			var dy = Getdy(alldirs[i]);
			var nextpos = {x: pos.x + dx, y: pos.y + dy};
			var nextposcontents = map[nextpos.y][nextpos.x]; 
			if ((typeof nextposcontents != "undefined") && (nextposcontents < map[pos.y][pos.x]))
			{
				path.push(ReverseDir(alldirs[i]));
				pos = nextpos;
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
Empty.prototype.placeon = true;

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
}

var GameObjects = [new Wall, new Empty, new Agent];

var GameObjectsAppearances = '';

var Picker =
{
}

var Delete =
{
}

var WallSelector =
{
	appearance: "#",
	select: Wall
}

var AgentSelector =
{
	appearance: "@",
	select: Agent
}

var PickerSelector =
{
	appearance: "S",
	select: Picker,
}

var EmptySelector =
{
	appearance: "X",
	select: Delete
}

var PaletteItems = [PickerSelector, WallSelector, AgentSelector, EmptySelector];

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

function InitGameObjectAppearances()
{
	for (var i = 0; i < GameObjects.length; i++)
	{
		GameObjectsAppearances += (GameObjects[i].appearance + ' ');
	}
}

function InitMap()
{
	var devmap = ascii_art_to_map(testmap().map);
	for(var iy = 0; iy < devmap.length; iy++)
	{
		var columnarray = []
		for(var ix = 0; ix < devmap[iy].length; ix++)
		{
			columnarray.push(devmap[iy][ix]);
		}
		Map.push(columnarray)
	}
}

function InitScreen()
{
	for(var iy = 0; iy < Map.length; iy++)
	{
		var row = $('<div class="row"></div>', mappos);
		var mappos = $("#Map");
		row.appendTo(mappos)
		var columnarray = []
		for(var ix = 0; ix < Map[iy].length; ix++)
		{
			var column = $('<div class="column"</div>', row);
			(function(ix, iy) {
				column.mousedown(function(event)
				{
					MapInteract(ix, iy);
				})
			})(ix, iy);
			column.appendTo(row);
			columnarray.push(column);
		}
		Screen.push(columnarray);
	}
}

function AddToMap(object, x, y)
{
	switch (object)
	{
		case Agent:
			if (Map[y][x].placeon && Map[y][x].contents.length == 0) 
			{
				var agent = new Agent(y,x);
				Map[y][x].contents.push(agent);
				DynamicObjects.push(agent);
			}
			break;
		default:
			if (Map[y][x].placeon)
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
		var row = $('<div class="row"></div>');
		var palettepos = $("#Palette");
		row.appendTo(palettepos);
		(function(iy) {
			row.mousedown(function(event)
				{
					SetActivePaletteItem(iy);
				})
		})(iy);
		row.text(PaletteItems[iy].appearance);
		Palette.push(row);
	}
	if (ActivePaletteItem)
	{
		$(Palette[ActivePaletteItem.y]).addClass("paletteselected");
	}
}

function SetActivePaletteItem(y)
{
	var previtem = ActivePaletteItem;
	previtem.y = ActivePaletteItem.y;
	ActivePaletteItem = PaletteItems[y].select;
	ActivePaletteItem.y = y;
	$(Palette[ActivePaletteItem.y]).addClass("paletteselected");
	$(Palette[previtem.y]).removeClass("paletteselected");
}


//Draw one step from the path
function DrawPath(path,map,pos,agent)
{
	var dx = Getdx(path[0]);
	var dy = Getdy(path[0]);
	var nextpos = {x: pos.x + dx, y: pos.y + dy};
	map[nextpos.y][nextpos.x].contents.push(agent);
	map[pos.y][pos.x].contents.pop();
	return nextpos;
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
function DrawTile(screenpos, maptile)
{
	var screenposclasses = $(screenpos).attr("class").split(" ");
	var maptileclasses = ["column"];
	maptileclasses.push(maptile.appearance);
	if (maptile.contents && (maptile.contents.length >= 1)) 
	{
		maptileclasses.push(maptile.contents[0].appearance);
		if (maptile.contents[0].selected)
		{
			maptileclasses.push("mapselected");
		}
	}
	if (maptileclasses.length != screenposclasses.length)
	{
		$(screenpos).removeClass();
		$(screenpos).addClass(maptileclasses.join(" "));
	}
	else
	{
		for (var i = 0; i < maptileclasses.length; i ++)
		{
			if (maptileclasses[i] != screenposclasses[i])
			{
				$(screenpos).removeClass();
				$(screenpos).addClass(maptileclasses.join(" "));
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


InitGameObjectAppearances();
InitMap();
InitScreen();
InitPalette();
Tick();
