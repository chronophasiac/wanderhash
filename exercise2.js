'use strict';

/*
1. Write a function isprime(n) which returns whether a number is prime.

    isprime(2) => true
    isprime(15) => false
    isprime(1) => false
    */

function isprime(n)
{
	if(n == 1) return false;
	for(var i = 2; i < (n - 1); i++)
	{
		if( n % i == 0) return false;
	}
	return true;
}


/*
2. Write a function factor(n) which returns an array of a number's prime
factors, in sorted order.

    factor(10) => [2,5]
    factor(60) => [2,2,3,5]
    factor(5) => [5]
    factor(1) => []
*/

function factor(n)
{
	var factors = [];
	if(n == 1) return factors;
	var i = 2
	do
	{
		if (n % i == 0) 
		{
			n = n / i;
			if(isprime(i)) factors.push(i);
		}
		else i++;
	}
	while (n > 1)
	return factors;
}

/*
3. Write a pair of functions array_to_linkedlist(arr) and
linkedlist_to_array(list), which convert between arrays and linked list. Linked
lists are sets of objects, each of which has a 'val' field that contains the
value, and a 'next' field which contains a reference to the next object (or
null if it's the last in the list). Lists also have a "dummy node" (an object
containing only a next pointer); empty lists are lists where the next pointer
inside this dummy node is null. The list as a whole is represented by a
reference to the dummy node.


    list = array_to_linkedlist([1,2,3]) =>

         list
          |
          v
        +------+    +------+    +------+    +------+
        |val | | +->|val |1| +->|val |2| +->|val |3|
        |next|---+  |next|---+  |next|---+  |next| |
        +------+    +------+    +------+    +------+

        list == ({
            next: {
                val: 1,
                next: {
                    val: 2,
                    next: {
                        val: 3,
                        next: null
                    }
                }
            }
        })

    linkedlist_to_array(list) => [1,2,3]

In later exercises, use the list directly; don't convert to an array.
*/

function array_to_linkedlist(arr)
{
	var linkedlist = {next: null};
	var pos = linkedlist;
	for(var i = 0; i < arr.length; i++)
	{
		pos.next = {next: null};
		pos.next.val = arr[i];
		pos = pos.next;
	}
	return linkedlist;
}

function linkedlist_to_array(list)
{
	var arr = [];
	for(var i = list; i.next != null; i = i.next)
	{
		arr.push(i.next.val);
	}
	return arr;
}


/*
4. Write a function linkedlist_print(list) which prints (using console.log) the
elements in a linked list in order. There should be commas between elements,
but no trailing comma at the end.

    linkedlist_print(array_to_linkedlist([1,2,3])) => "1, 2, 3"
    linkedlist_print(array_to_linkedlist([])) => ""
*/

function linkedlist_print(list)
{
	var print = "";
	var j = 0;
	for(var i = list; i.next != null; i = i.next)
	{
		if(j == 0) print = print + i.next.val;
		else
		{
		print = print + ", " +  i.next.val;
		}
		j++;
	}
	console.log(print);
}

/*
5. Write a function linkedlist_to_array(list) which takes a linked list (like
the one you built in (3) and converts it to an array.

Duplicate of 3. -MR

6. Write a function linkedlist_find(list,value) which returns the first linked
list node with the given value (if there is one), or null if there isn't.

    list = array_to_linkedlist([1,2,3])
    result = linkedlist_find(list, 2)

          list                   result
           |                       |
           v                       v
        +------+    +------+    +------+    +------+
        |val | | +->|val |1| +->|val |2| +->|val |3|
        |next|---+  |next|---+  |next|---+  |next| |
        +------+    +------+    +------+    +------+

*/
function linkedlist_find(list,value)
{
	for(var i = list; i.next != null; i = i.next)
	{
		if(i.val == value) return i;
	}
	return null;
}

/*
7. Write a function linkedlist_delete(list, value) which modifies the list by
removing the first linked list node with the given value (if there is one) from
the list. Returns that node (if one was deleted), or null if no match was
found.

    list = array_to_linkedlist([1,2,3])
    result = linkedlist_delete(list, 2)

          list                   result
           |                       |
           v                       v
        +------+    +------+    +------+    +------+
        |val | | +->|val |1|    |val |2|    |val |3|
        |next|---+  |next|---+  |next| | +->|next| |
        +------+    +------+ |  +------+ |  +------+
                             +-----------+
*/

function linkedlist_delete(list,value)
{
	var DeletedNode;
	for(var i = list; i.next != null; i = i.next)
	{
		if(i.next.val == value)
		{
			DeletedNode = i.next;
			i.next = i.next.next;
			return DeletedNode;
		}
	}
	return null;
}


/*
8. Write a function linkedlist_reverse(list) which reverses the order of the
elements in a linked list in place and returns the dummy node of the new list.

          
                        +----------------+
                        |             ___|_____________
                        v            v   |             |
        +------+    +------+    +------+ |    +------+ |
        |val | |    |val |1|    |val |2| |    |val |3| |
        |next|---+  |next| |    |next|---+ +->|next|---+
        +------+ |  +------+    +------+   |  +------+
                 |                         | 
                 +-------------------------+ 
*/

function linkedlist_reverse(list)
{
	var prevpos = list.next;
	var pos = prevpos.next; 
	var nextpos = pos.next;
	prevpos.next = null;
	do
	{
		pos.next = prevpos;		
		prevpos = pos;
		pos = nextpos;
		if(nextpos != null) nextpos = nextpos.next;
	}
	while (pos != null);
	list.next = prevpos;
	return list;
}

/*
9. Write a function linkedlist_count(list) which returns the number of
elements in a linked list (not counting the dummy node).
*/

function linkedlist_count(list)
{
	var count = 0;
	for(var i = list; i.next != null; i = i.next)
	{
		count++;
	}
	return count;
}

/*
10. Write a function linkedlist_index(list, n) which returns the nth node of
the list.
*/

function linkedlist_index(list,n)
{
	var count = 0;
	for(var i = list; i.next != null; i = i.next)
	{
		if(count == n) return i;
		count++;
	}
	return null;
}

/*
11. Write a function linkedlist_concat(a,b) which takes two linked lists and
concatenates them into a longer list.

    list1 = array_to_linkedlist([1,2,3])
    list2 = array_to_linkedlist([4,5,6])
    combined_list = linkedlist_concat(list1, list2)
    linkedlist_print(combined_list) => "1, 2, 3, 4, 5, 6"
*/

function linkedlist_concat(a,b)
{
	for(var i = a; i.next != null; i = i.next);
	i.next = b.next;
	return a;
}

/*
12. Write a function linkedlist_merge_sorted(a, b) which takes two sorted
lists, and merges them into a combined sorted list.

    list1 = array_to_linkedlist([1,5,9])
    list2 = array_to_linkedlist([3,7,8])
    combined_list = linkedlist_merge_sorted(list1, list2)
    linkedlist_print(combined_list) => "1, 3, 5, 7, 8, 9"
    */

function linkedlist_merge_sorted(a,b)
{
	var merged = {next: null};
	var pos_merged = merged;
	var pos_a = a.next;
	var pos_b = b.next;
	do
	{
		pos_merged.next = {next:null};
		if((pos_a != null) && (pos_b != null))
		{
			if (pos_a.val < pos_b.val)
			{
				pos_merged.next.val = pos_a.val;
				pos_a = pos_a.next;
			}
			else
			{
				pos_merged.next.val = pos_b.val;
				pos_b = pos_b.next;
			}
		}
		else if (pos_a == null) 
		{
			pos_merged.next.val = pos_b.val;
			pos_b = pos_b.next;
		}
		else 
		{
			pos_merged.next.val = pos_a.val;
			pos_a = pos_a.next;
		}
		pos_merged = pos_merged.next;
	}
	while ((pos_a != null) || (pos_b != null));
	return merged;
}

/*
13. Write a sort function linkedlist_sort(list) using merge-sort. Merge-sort is
a sorting algorithm that works like this:

    To merge-sort a list of zero or one elements, return the same list
    To merge-sort a list of two or more elements:
        Split the list in half
        Merge-sort each half
        Merge the halves into a larger list
*/
function linkedlist_split(list)
{
	var count = linkedlist_count(list);
	var a = list;
	var pos_a = a;
	for (var i = 0; i < Math.floor(count / 2); i++)	pos_a = pos_a.next;
	var b = {next:pos_a.next};
	pos_a.next = null;
	return [a,b]
}

function linkedlist_sort(list)
{
	var count = linkedlist_count(list);
	if (count <= 1) return list;
	else
	{
		var split = linkedlist_split(list);
		var a = linkedlist_sort(split[0]);
		var b = linkedlist_sort(split[1]);
		return linkedlist_merge_sorted(a,b);
	}
}

/* Write a function array_to_binary_tree(a) that takes an array and returns a binary tree. Split the array into a first half, a middle of size 1, and a second half. The output tree should be similarly balanced */

function array_to_binary_tree_split(array)
{
	if (array.length >= 3)
	{
		var left = [];
		var right = [];
		for (var i = 0; i < (Math.floor((array.length / 2))); i++) left.push(array[i]);
		for (var j = i + 1; j < array.length; j++) right.push(array[j]);
		var val = array[i++];
		return {val:val,left:left,right:right};
	}
	else if (array.length == 2) return {val:array[1],left:[array[0]],right:null};
	else if (array.length == 1) return {val:array[0],left:null,right:null};
}
	
function array_to_binary_tree(a)
{
	var split = array_to_binary_tree_split(a);
	if ((split.left == null) && (split.right == null)) return split;
	if (split.right != null) split.right = array_to_binary_tree(split.right);
	if (split.left != null) split.left = array_to_binary_tree(split.left);
	return split;
}

/* Write a function tree_size(t) which returns the number of elements in a tree */

/*function tree_size(t)
{
	var count = 0;
	if (t == null) return 0;
	if ((t.left == null) && (t.right == null)) count++;
	if (t.right != null) 
	{
		count = count + tree_size(t.right);
		count ++;
		var used = 1;
	}
	if (t.left != null) 
	{
		count = count + tree_size(t.left);
		if (used != 1) count ++;
	}
	return count;
}
*/

/*
function tree_size(t)
{
	var count = 0;
	if (t == null) return 0;
	count =  count + tree_size(t.left);
	count =  count + tree_size(t.right);
	count ++;
	return count;
}
*/

function tree_size(t)
{
	if (t == null) return 0;
	t.val = 0;
	t.val = t.val + tree_size(t.left);
	t.val = t.val + tree_size(t.right);
	t.val ++;
	return t.val;
}


/* Write a function tree_print(t) which prints (using console.log) all of the elements in a tree, in order.*/

/*
function tree_print(t)
{
	if (t.left != null) 
	{
		tree_print(t.left);
		console.log(t.val);
		var used = 1;
	}
	if ((t.left == null) && (t.right == null)) 
	{
		console.log(t.val);
		return;
	}
	if (t.right != null) 
	{
		tree_print(t.right);
		if (used != 1) console.log(t.val);
	}
	return;
}
*/

function tree_print(t)
{
	if (t.left != null) tree_print(t.left);
	if (t.val != undefined) 
	{
		console.log(t.val);
	}
	if (t.right != null) tree_print(t.right);
	return;
}

/* Write a function tree_find(t,n) that returns true if the number is in the tree and false if it is not */

function tree_find(t,n)
{
	if (t.val == n) return true;
	if ((n < t.val) && (t.left != null)) 
	{
		return (tree_find(t.left,n)); 
	}
	if ((n > t.val) && (t.right != null)) 
	{
		return (tree_find(t.right,n)); 
	}
	else return false;
}

/* Write a function tree_insert(t,n) that inserts a number n into a tree t, preserving the correct order*/

function tree_insert(t,n)
{
	if (t.val == n)
	{
		console.log("Number is already in tree");
		return;
	}
	if ((n < t.val) && (t.left != null)) tree_insert(t.left,n);
	if ((n > t.val) && (t.right != null)) tree_insert(t.right,n);
	else if (t.left == null) t.left = {val:n,left:null,right:null};
	else if (t.right == null) t.right = {val:n,left:null,right:null};
	return;
}

/* Write a function tree_remove(t,n) that removes a number n from a tree t, preserving the correct order*/

function tree_del(t)
{
	if (t.right != null)
	{
		var prev = t;
		t = t.right;
		while (t.left != null) 
		{
			prev = t;
			t = t.left;
		}
		return [prev,t];
	}
	if (t.left != null)
	{
		var prev = t;
		t = t.left;
		while (t.right != null) 
		{
			prev = t;
			t = t.right;
		}
		return [prev,t];
	}
	else return null;
}

function tree_remove(t,n)
{
	if (t.val == n)
	{
		var del = tree_del(t);
		if (del != null) 
		{
			var prev = del[0];
			var r = del[1];
			t.val = r.val;
			prev.left = r.left;
			prev.right = r.right;
			r.val = null;
		}
		else t.val = null;
		return;
	}
	if ((n < t.val) && (t.left != null))
	{
		tree_remove(t.left,n);
		if (t.left.val == null) t.left = null;
		return;
	}
	if ((n > t.val) && (t.right != null))
	{
		(tree_remove(t.right,n));
		if (t.right.val == null) t.right = null;
		return;
	}
	else return false;
}

/* Write a recursive function to determine if a string is a palindrome --Dan */

function is_palindrome(string)
{
	var stringarray = [];
	for (var i = 0; i < string.length; i++) 
	{
		stringarray.push(string[i]);
	}
	if (stringarray.length <= 2) return false;
	else
	{
		if (stringarray[0] == stringarray[(stringarray.length - 1)]) 
		{
			if (stringarray.length == 3) return true;
			else 
			{
				var newstringarray = [];
				for (var i = 1; i < (stringarray.length - 1); i++)
				{
					newstringarray.push(stringarray[i]);
				}
				return is_palindrome(newstringarray);

			}
		}
		else return false;
	}
}

/* Write a function doubletree_remove(t,n) that takes a doubly linked tree and removes n from it, preserving order */

function array_to_binary_doubletree_split(array)
{
	if (array.length >= 3)
	{
		var left = [];
		var right = [];
		for (var i = 0; i < (Math.floor((array.length / 2))); i++) left.push(array[i]);
		for (var j = i + 1; j < array.length; j++) right.push(array[j]);
		var val = array[i++];
		return {val:val,left:left,right:right,};
	}
	else if (array.length == 2) return {val:array[1],left:[array[0]],right:null};
	else if (array.length == 1) return {val:array[0],left:null,right:null};
}

function array_to_binary_doubletree(a)
{
	var split = array_to_binary_doubletree_split(a);
	if ((split.left == null) && (split.right == null)) return split;
	if (split.right != null) 
	{
		split.right = array_to_binary_doubletree(split.right);
		split.right.up = split;
	}
	if (split.left != null) 
	{
		split.left = array_to_binary_doubletree(split.left);
		split.left.up = split;
	}
	return split;
}

/*
function doubletree_remove(t,n)
{
	if (t.val == n)
	{
		if (t.up != null)
		{
			t.up ==
*/

/* Write a function quicksort(a) that takes an array and recursively sorts it. Find a pivot (not the smallest value). If a value is smaller than the pivot, swap it to the beginning of the array and increment the beginning. If a value is larger than the pivot, swap it to the end of the array and increment the end. Do this recursively.*/

function quicksort(a,begin,end)
{
	if ((typeof begin) === 'undefined') var begin = 0;
	if ((typeof end) === 'undefined') var end = (a.length - 1);
	var first = begin;
	var last = end;
	var length = (end-begin) + 1;
	if (length <= 0) return a;
	if (length == 1) return a;
	if (length == 2)
	{
		if (a[begin] < a[end]) return a;
		else
		{
			var temp = a[begin];
			a[begin] = a[end];
			a[end] = temp;
			return a;
		}
	}
	var pivot = a[begin];
	var pos = begin + 1;
	do
	{
		if (a[pos] < pivot)
		{
			var temp = a[begin];
			a[begin] = a[pos];
			a[pos] = temp;
			begin++;
			pos++;
		}
		else if (a[pos] > pivot)
		{
			var temp = a[end];
			a[end] = a[pos];
			a[pos] = temp;
			end--;
		}
		else pos++;
	}
	while (pos <= end);
	quicksort(a,first,pos - 2);
	quicksort(a,pos,last);
	return a;
}
			
/* Write a function binary_tree_to_array(t) that takes a tree and returns an array.*/

function binary_tree_to_array(t)
{
}

/* Write a function tree_smallest_val(t) that takes a tree and returns the smallest value in the tree */



/* Write a function tree_largest_val(t) that takes a tree and returns the largest value in the tree */



/* Write a function tree_check_validity(t) that takes a tree and returns true if the tree is a binary search tree and returns false if it is not */



/* Write a function tree_reverse(t) that takes a tree and returns a tree with values in reverse order */



/* Write a function tree_insert_val(t,val) that takes a tree and a value and inserts the value into the tree at the correct position */



/* Write a function tree_delete_val(t,val) that takes a tree and a value and deletes the value from the tree */



/* Write a function tree_balance(t) that takes a tree and balances it */
