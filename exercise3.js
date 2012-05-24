// Write a pathfinding function pathflinder(map,start,end)

var empty =
{
	appearance: " ",
	walkable: true
}

var wall =
{
	appearance: "#",
	walkable: false
}

var agent =
{
	appearance: "@"
}

function comparedist(a,b)
{
	return a.dist - b.dist;
}

function getdx(dirname)
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

function getdy(dirname)
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

function reversedir(dirname)
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
			console.log("reversedir error");
			break;
	}
}

function pathflinder(orig_map,start,end)
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
			var dx = getdx(alldirs[i]);
			var dy = getdy(alldirs[i]);
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
		frontier.sort(comparedist);
	}
	if (typeof map[end.y][end.x] == "undefined") return false;
	var pos = end;
	var path = [];
	while (map[pos.y][pos.x] != 0)
	{
		for (i = 0; i < alldirs.length; i++)
		{
			var dx = getdx(alldirs[i]);
			var dy = getdy(alldirs[i]);
			var nextpos = {x: pos.x + dx, y: pos.y + dy};
			var nextposcontents = map[nextpos.y][nextpos.x]; 
			if ((typeof nextposcontents != "undefined") && (nextposcontents < map[pos.y][pos.x]))
			{
				path.push(reversedir(alldirs[i]));
				pos = nextpos;
				break;
			}
		}
	}
	path = path.reverse();
	return path;
}

function Draw_Path(path,map,start)
{
	var pos = start;
	map[pos.y][pos.x] = agent;
	DrawTile(Screen[pos.y][pos.x], Map[pos.y][pos.x]);
	for (i = 0; i < path.length; i++)
	{
		var dx = getdx(path[i]);
		var dy = getdy(path[i]);
		var nextpos = {x:pos.x + dx, y:pos.y + dy};
		map[pos.y][pos.x] = empty;
		DrawTile(Screen[pos.y][pos.x], Map[pos.y][pos.x]);
		map[nextpos.y][nextpos.x] = agent;
		DrawTile(Screen[nextpos.y][nextpos.x], Map[nextpos.y][nextpos.x]);
		pos = nextpos;
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
					contents = empty;
					break;
				case "#":
					contents = wall;
					break;
				default:
					contents = empty;
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
				case empty:
					contents = " ";
					break;
				case wall:
					contents = "#";
					break;
				case agent:
					contents = "@";
					break;
				default:
					contents = empty;
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

var Screen = []
function InitScreen()
{
	for(var y=0; y < Map.length; y++)
	{
		var row = $('<div class="row"></div>')
		row.appendTo('body')
		var ColumnArray = []
		for(var x=0; x < Map[0].length; x++)
		{
			var column = $('<div class="column"></div>');
			(function(x,y) {
				column.click(function(event)
				{
					Get_Path(x,y);

					DrawTile(Screen[y][x], Map[y][x]);
				})
			})(x,y);
			column.appendTo(row)
			ColumnArray.push(column)
		}
		Screen.push(ColumnArray)
	}
}

function Get_Path(x,y)
{
	if (typeof Start == "undefined")
	{
		Start = {x: x, y: y};
		Map[y][x] = agent;
	}
	else
	{
		var End = {x: x, y: y};
		var Path = pathflinder(Map, Start, End);
		Draw_Path(Path, Map, Start)
	}
}


/*Initialize the Map, the complete game board*/
var Map = ascii_art_to_map(testmap().map);
/*function InitMap()
{
	for(var y=0; y < 20; y++)
	{
		var ColumnArray = []
		for(var x=0; x < 20; x++)
		{
			ColumnArray.push({
				contents: empty,
			})
		}
		Map.push(ColumnArray)
	}
}
*/

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

//InitMap()
InitScreen()
UpdateScreen()
