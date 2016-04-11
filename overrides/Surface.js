Ext.define("Metric.overrides.Surface", {
	override: "Ext.draw.Surface",
	createGroup: function (id) {
		var group = this.groups.get(id);
		if (!group) {
			group = new Ext.draw.CompositeSprite({
				surface: this
			});
			group.id = id || Ext.id(null, 'ext-surface-group-');
			// FIXED: pass key + value to add, not only value
			this.groups.add(id, group);
		}
		return group;
	}
});