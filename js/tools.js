var Tools =
{
	getBrowserWidth: function()
	{
		return window.innerWidth;
	},

	getBrowserHeight: function()
	{
		return window.innerHeight;
	},

	randomRange :function(min, max)
	{
    return Math.floor(Math.random() * (max - min) + min);
	},
}
