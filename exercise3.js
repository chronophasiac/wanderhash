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
			console.log("ERR!");
	}
}

/*
function iswalkable(tile)
{
	if (tile != "#") return true;
	else return false;
}
*/

function pathflinder(orig_map,start,end)
{
	var map = [];
	for (var iy = 0; iy < orig_map.length; iy++)
	{
		map.push({});
	}
	map[start.y][start.x] = 0;
	var frontier = [{dist:0,x:start.x,y:start.y}];
	var alldirs = ["north","northeast","east","southeast","south","southwest","west","northwest"];
	while (frontier.length > 0)
	{
		for (i = 0; i < alldirs.length; i++)
		{
			var dx = getdx(alldirs[i]);
			var dy = getdy(alldirs[i]);
			var visited = {dist:(map[frontier[0].y][frontier[0].x]) + 1, x:frontier[0].x + dx, y:frontier[0].y + dy};
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
	if (map[end.y][end.x] == "e") return false;
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
	var pos = start;
	for (i = 0; i < path.length; i++)
	{
		orig_map[pos.y][pos.x] = agent;
		var dx = getdx(path[i]);
		var dy = getdy(path[i]);
		pos = {x:pos.x + dx,y:pos.y + dy};
		map_to_ascii_art(orig_map);
	}
	return path;
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
	for(var y=0; y < 20; y++)
	{
		var row = $('<div class="row"></div>')
		row.appendTo('body')
		var ColumnArray = []
		for(var x=0; x < 20; x++)
		{
			var column = $('<div class="column"></div>');
			(function(x,y) {
				column.click(function(event)
				{
					Map[y][x].contents = wall 
					DrawTile(Screen[y][x], Map[y][x])
				})
			})(x,y);
			column.appendTo(row)
			ColumnArray.push(column)
		}
		Screen.push(ColumnArray)
	}
}

/*Initialize the Map, the complete game board*/
var Map = []
function InitMap()
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

/*Update the Screen with data from the Map, and draw graphics*/
function UpdateScreen()
{
	for(var y=0; y < 20; y++)
	{
		for(var x=0; x < 20; x++)
		{
			DrawTile(Screen[y][x], Map[y][x])
		}
	}
}

/*Insert the graphics from map coordinates to screen coordinates*/
function DrawTile(screenPos, mapTile)
{
	screenPos.text(mapTile.contents.appearance)
}

InitScreen()
InitMap()
UpdateScreen()
