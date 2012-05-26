// Write a pathfinding function Pathflinder(map,start,end)

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

var Agent =
{
	appearance: "@"
}

function CompareDist(a,b)
{
	return a.dist - b.dist;
}

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

function ascii_art_to_map(map)
{
	var columnarray = [];
	for (var iy = 0; iy < map.length; iy++)
	{
		var rowarray = [];
		for (var ix = 0; ix < map[iy].length; ix++)
		{
			var contents;
			switch (map[iy][ix])
			{
				case " ":
					contents = Empty;
					break;
				case "#":
					contents = Wall;
					break;
				default:
					contents = Empty;
					console.log("ascii_art_to_map error");
					break;
			}
			rowarray.push(contents);
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

var Screen = []
function InitScreen()
{
	for(var y=0; y < Map.length; y++)
	{
		var row = $('<div class="row"></div>')
		row.appendTo('body')
		var columnarray = []
		for(var x=0; x < Map[0].length; x++)
		{
			var column = $('<div class="column"></div>');
			(function(x,y) {
				column.click(function(event)
				{
					SetStartEnd(x,y);
				})
			})(x,y);
			column.appendTo(row)
			columnarray.push(column)
		}
		Screen.push(columnarray)
	}
}

var Start;
var End;
function SetStartEnd(x,y)
{
	if (typeof Start == "undefined")
	{
		Start = {x: x, y: y};
	}
	else
	{
		End = {x: x, y: y};
	}
}


/*Initialize the Map, the complete game board*/
var Map = ascii_art_to_map(testmap().map);
/*function InitMap()
{
	for(var y=0; y < 20; y++)
	{
		var columnarray = []
		for(var x=0; x < 20; x++)
		{
			columnarray.push({
				contents: Empty,
			})
		}
		Map.push(columnarray)
	}
}
*/

function DrawPath(path,map,start)
{
	var pos = start;
	var dx = Getdx(path[0]);
	var dy = Getdy(path[0]);
	var nextpos = {x:pos.x + dx, y:pos.y + dy};
	map[pos.y][pos.x] = Empty;
	map[nextpos.y][nextpos.x] = Agent;
	Start = nextpos;
}

/*Update the Screen with data from the Map, and draw graphics*/
function UpdateScreen()
{
	for(var y=0; y < Map.length; y++)
	{
		for(var x=0; x < Map[0].length; x++)
		{
			DrawTile(Screen[y][x], Map[y][x])
		}
	}
}

/*Insert the graphics from map coordinates to screen coordinates*/
function DrawTile(screenPos, mapTile)
{
	screenPos.text(mapTile.appearance)
}

function RunFrame()
{
	if ((typeof Start != "undefined") && (typeof End != "undefined") && ((Start.y != End.y) || (Start.x != End.x)))
	{
		var path = Pathflinder(Map,Start,End);
		if (path) DrawPath(path,Map,Start);
	}
	if ((typeof Start != "undefined") && (typeof End == "undefined"))
	{
	Map[Start.y][Start.x] = Agent;
	}
}

function Tick()
{
	RunFrame();
	UpdateScreen();
	setTimeout(Tick,100);
}

//InitMap()
InitScreen()
Tick()
