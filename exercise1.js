/*Here is a problem set that I think will be helpful. These may take more than
one sitting. They are approximately in order of ascending difficulty. While I
generally believe in doing programming in long bursts, for these I believe there
may be a spaced-repetition sort of effect such that a little each day would be
good.

   1. Write all answers in Javascript
   2. Test your answers in a Javascript console
   3. Do not use any functions except those you write yourself, plus
      Array.push and console.log

The goal of these exercises is to practice reasoning about control flow. You
should be able to do all of these using for, while, break, and return.

One of my motivations for writing these is that I'm trying to identify
the micro-
skills in programming (5-second skills and especially 500ms-skills).

1. Write a function array_max(a) which returns the largest value in an array of
numbers

   array_max([5,1,9,-2,5]) => 9
   array_max([0]) => 0
   array_max([]) => undefined
*/

/*First try:
/*function array_max(a)
{
	highnum = 0
	for (i = 0;a[i] != undefined;i++)
	{
		if (a[i] > highnum)
		{
			highnum = a[i]
		}
	}
	if (a[0] == undefined)
	{
		return undefined
	}
	else
	{
		return highnum
	}
}
*/		

function cardinality(a)
{
	for(i in a){}
	return i
}

function is_valid(a)
{
	if( (a!==undefined) && (!isNaN(a) ) )
	{
		return true;
	}
}
 
function array_max(a)
{
	var max;
	for(i in a)
	{
		if (is_valid(a[i]))
		{
			max=a[i];
			break;
		}
	}
	for(i in a)
	{
		if (a[i] > max)
		{
			max = a[i];
		}
	}
	return max;
}

/*2. Write a function array_positive(a) which returns whether all the elements in
an array of numbers are positive.

   array_positive([4,-1,5,6]) => false
   array_positive([0,1,2,3]) => true
   array_positive([]) => true
   */

function array_positive(a)
{
	var bool = 0;
	for (i in a)
	{
		if (a[i] < 0)
		{
			bool = 1;
		}
	}
	if (bool === 1)
	{
		return false;
	}
	else
	{
		return true;
	}
}

/*3. Write a function array_copy(a) which takes an array and returns a new copy
of it.

   original = [1,2,3]
   copy = array_copy(original)      => [1,2,3]
   original.push(4)                 => [1,2,3,4]
   copy                             => [1,2,3]
   */

function array_copy(a)
{
	var copy = []
	for (i in a)
	{
		copy.push(a[i])
	}
	return copy
}

/*3. Write a function array_reverse(a) which takes an array and returns the
elements in reverse order.

   array_reverse([1,2,3,4]) => [4,3,2,1]
   */

function array_reverse(a)
{
	var reverse = [];
	for (i in a)
	{
		reverse.push(a[(a.length-1) - i])
	}
	return reverse;
}



/*
4. Write a function array_compare(a,b) which returns whether two arrays of
numbers are equal.

   array_compare([1,2,3,4], [1,2,3,4]) => true
   array_compare([1,2,3], [1,2,3,4]) => false
   array_compare([1,2,3], [3,2,1]) => false
*/

/*function array_compare(a,b)
{
	var bool = 0;
	for (i in a)
	{
		if (a[i] !==  b[i])
		{
			bool = 1;
		}
	}
	for (i in b)
	{
		if (b[i] !==  a[i])
		{
			bool = 1;
		}
	}
	if (bool === 1)
	{
		return false;
	}
	else
	{
		return true;
	}
}
*/
function array_compare(a,b)
{
	if (a.length!=b.length) return false
	for (var i = 0; i < a.length; i++)
	{
		if (a[i] != b[i]) return false
	}
	return true
}

/*
5. Write a function array_is_palindromic(a) which returns whether an array of
numbers is the same forwards and backwards.

   array_is_palindromic([1,2,3]) => false
   array_is_palindromic([1,2,3,2,1]) => true
   array_is_palindromic([]) => true
   */

function array_is_palindromic(a)
{
	if (array_compare(a, array_reverse(a)))
	{
		return true
	}
	else
	{
		return false
	}
}


/*
6. Write a function array_is_ascending(a) which returns whether an array of
numbers is sorted in ascending order.

   array_is_ascending([1,2,3]) => true
   array_is_ascending([1,3,2]) => false
   array_is_ascending([3,2,1]) => false
   array_is_ascending([]) => true
   array_is_ascending([1]) => true
   */

/*function array_is_ascending(a)
{
	c = 0
	for (i in a)
	{
		if (a[i] < a[i+1])
		{
			c++
		}
	}
	if (c == i)
	{
		return true
	}
	else
	{
		return false
	}
}
*/

function array_is_ascending(a)
{
	for (var i = 0; i < a.length - 1; i++)
	{
		if (a[i] >= a[i+1]) return false
	}
	return true
}

/*
7. Write a function array_slice(a,start,len) which returns 'len'
elements from an
array, starting at 'start'.

   array_slice([1,2,3,4,5,6,7], 2, 3) => [3,4,5]
   array_slice([1,2,3,4,5,6,7], 0, 7) => [1,2,3,4,5,6,7]
   array_slice([1,2,3,4,5,6,7], 0, 8) => undefined
   */

/*function array_slice(a,start,len)
{
	if ( (len - start) > (cardinality(a)+1) )
	{
		return undefined;
	}
	else
	{
		var slice = [];
		for(i=start;i in a;i++)
		{

			slice.push(a[i]);
		}
		return slice;
	}
}
*/

function array_slice(a,start,len)
{
	if (start + len > a.length) return undefined
	var slice = []
	for (var i = start; i < (start + len); i++)
	{
		slice.push(a[i])	
	}
	return slice
}

/*
8. Implement selection sort. Selection sort is a sorting algorithm that works
like this (pseudocode):

   Make an empty array 'sorted'
   Make an array 'used' of bools, the same length as A, initially all false
   Repeat A.length times:
       Pick the smallest element A[ii] which is not used
       Append it to 'sorted'
       Mark it used by setting used[ii] to true
   Return 'sorted'
*/

function selection_sort(a)
{
	if (a.length == 1) return a
	var sorted = []
	var used = []
	var min
	for (var i = 0; i < a.length; i++)
	{
		used.push(false)
	}
	for (var i = 0; i < a.length; i++)
	{
		min = a[array_min_used(a,used)]	
		sorted.push(a[min])	
		used[min] = true
	}
	return sorted
}

function array_min_used(a,used)
{
	var min;
	for(var i = 0; i < a.length; i++)
	{
		if (is_valid(a[i]) && used[i] != true)
		{
			min = i;
			break;
		}
	}
	for(var i = 0; i < a.length; i++)
	{
		if (used[i] != true)
		{
			if (a[i] < a[min])
			{
				min = i;
			}
		}
	}
	return min;
}
/*
9. In-place selection sort is similar to selection sort, in that it works by
repeatedly finding the smallest element, but it is "in-place", meaning it
modifies the input array rather than building a new array.

   For each index ii in A:
       Find the index jj of the smallest element at ii or later
       Swap A[ii] with A[jj]

Implement in-place selection sort.
*/

function array_min_after(a,i)
{
	var min;
	for(var j = i; j < a.length; j++)
	{
		if (is_valid(a[j]))
		{
			min = j;
			break;
		}
	}
	for(var j = i; j < a.length; j++)
	{
		if (a[j] < a[min])
		{
			min = j;
		}
	}
	return min;
}

function in_place_selection_sort(a)
{
	if (a.length == 1) return a
	var temp;
	var minindex;
	for(var i = 0; i < a.length; i++)
	{
		minindex = array_min_after(a,i);
		temp = a[i];
		a[i] = a[minindex];
		a[minindex] = temp;
	}
	return a;
}
	
/*
10. Bubble-sort is an in-place sorting algorithm that works by comparing and
swapping consecutive elements in an array.

   Compare A[0] with A[1], swap if they are out of order
   Compare A[1] with A[2], swap if they are out of order
   Compare A[2] with A[3], swap if they are out of order
   Etc, until the end of the array
   Repeat until you go through the whole array without making any swaps

Implement bubble sort.*/

function bubble_sort(a)
{
	if (a.length == 1) return a
	var temp;
	var min;
	var count;
	do
	{
		count = 0
		for(var i = 0; i < (a.length + 1); i++)
		{
			if(a[i] > a[i + 1])
			{
				temp = a[i];
				a[i] = a[i + 1];
				a[i + 1] = temp;
				count++;
			}
		}
	}
	while(count > 0)
	return a
}
