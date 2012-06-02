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
					tile = Empty;
					break;
				case "#":
					tile = Wall;
					break;
				case "@":
					tile.contents = new Agent;
					break;
				default:
					tile = Empty;
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
var Empty =
{
	appearance: " ",
	walkable: true
}

var Wall =
{
	appearance: "#",
	walkable: false
}

var Agent = function()
{
	this.goal = null;
}

Agent.prototype.appearance = '@';
Agent.prototype.walkable = false;
Agent.prototype.moveTo = function(x,y)
{
	// TODO
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
	select: "picker"
}

var EmptySelector =
{
	appearance: "X",
	select: Empty
}

var PaletteItems = [PickerSelector, WallSelector, AgentSelector, EmptySelector];
var Map = [];
var Screen = [];
var Palette = [];
var Selector = Agent;
var SelectedAgent;

function InitMap()
{
	var devmap = ascii_art_to_map(testmap().map);
	for(var iy = 0; iy < devmap.length; iy++)
	{
		var columnarray = []
		for(var ix = 0; ix < devmap[iy].length; ix++)
		{
			devmap[iy][ix].contents = null;
			columnarray.push(devmap[iy][ix]);
		}
		Map.push(columnarray)
	}
}

function InitScreen()
{
	for(var iy = 0; iy < Map.length; iy++)
	{
		var row = $('<div class="row"></div>');
		var mappos = $("#Map");
		row.appendTo(mappos)
		var columnarray = []
		for(var ix = 0; ix < Map[iy].length; ix++)
		{
			var column = $('<div class="column"</div>');
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

function MapInteract(x, y)
{
	switch (Selector)
	{
		case "picker":
			if (Map[y][x].contents.appearance == "@")
			{
				SelectedAgent = Map[y][x].contents;
				$(Screen[y][x]).addClass("bold");
			}
			if ((Map[y][x].contents.appearance != "@") && (typeof SelectedAgent != "undefined"))
			{
				SelectedAgent.goal = {x: x, y: y};
			}
			break;
		case Agent:
			if (Map[y][x].contents != Agent) 
			{
				Map[y][x].contents = new Agent;
			}
			break;
		default:
			Map[y][x] = Selector;
			break;
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
					SetSelector(iy);
				})
		})(iy);
		row.text(PaletteItems[iy].appearance);
	}
}

function SetSelector(y)
{
	Selector = PaletteItems[y].select;
}


//Draw one step from the path
function DrawPath(path,map,pos,agent)
{
	var dx = Getdx(path[0]);
	var dy = Getdy(path[0]);
	var nextpos = {x: pos.x + dx, y: pos.y + dy};
	map[nextpos.y][nextpos.x].contents = agent;
	map[pos.y][pos.x] = Empty;
}

function EnumAgents()
{
	var agentarray = [];
	for (var iy = 0; iy < Map.length; iy++)
	{
		for (var ix = 0; ix < Map[iy].length; ix++)
		{
			if (Map[iy][ix].contents)
			{
				if (Map[iy][ix].contents.appearance == "@")
				{
					var agent = {ref: Map[iy][ix].contents, pos: {x: ix, y: iy}};
					if (agent.ref.goal && ((agent.pos.y != agent.ref.goal.y) || (agent.pos.x != agent.ref.goal.x)))
					{
						agentarray.push(agent);
					}
				}
			}
		}
	}
	return agentarray;
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
	screenpos.text(maptile.appearance);
	if (maptile.contents) screenpos.text(maptile.contents.appearance);
}

//Get the path for the agents, then draw it.
function RunFrame()
{
	var agentarray = EnumAgents();
	for (var i = 0; i < agentarray.length; i++)
	{
		var path = Pathflinder(Map,agentarray[i].pos,agentarray[i].ref.goal);
		if (path) DrawPath(path,Map,agentarray[i].pos,agentarray[i].ref);
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
