const fs = require('fs');

export default class UndertaleSFX
{
	/*
	[Field Variables]
	- BEEPS (Object): Determine the beep sound to use based on the character and their expression. Expression overrides Character.
	- beepSound (Object): The ig.Sound object used for the beep.
	This code is super ghetto compared to the Voice Mod. Refer to that and the comments there.
	*/

	constructor(mod)
	{
		const modConfigDir = `assets/mods/config/${mod.name}/`;
		const modBaseDir = fs.existsSync(modConfigDir) ? modConfigDir : mod.baseDirectory;
		this.configURL = `/${modBaseDir}config.json`;
		this.voiceBaseURL = `/${modBaseDir}vc/`;
	}

	async prestart()
	{
		this.BEEPS = await ccmod3.resources.loadJSON(this.configURL);
		const self = this;

		ig.EVENT_STEP.SHOW_MSG.inject({
			beepSound: null,
			init: function()
			{
				this.parent(...arguments);
				this.beepSound = self._getBeepSound(this.person, this.charExpression.expression);
			},
			start: function()
			{
				self.beepSound = this.beepSound;
				this.parent(...arguments);
			}
		});

		ig.MessageOverlayGui.Entry.inject({
			addMessage: function()
			{
				if(self.beepSound && self.beepSound.constructor !== Array)
					this.beepSound = self.beepSound || this.beepSound;
				return this.parent(...arguments);
			}
		});

		sc.TextGui.inject({
			update: function()
			{
				if(self.beepSound && self.beepSound.constructor === Array)
					this.beepSound = self.beepSound[self._getRandom(0, self.beepSound.length)];
				this.parent(...arguments);
			}
		});
	}

	_getBeepSound(character, expression)
	{
		var Z = this.BEEPS[character];
		var sound = Z ? (Z[expression] || Z['DEFAULT']) : null;
		var list;

		// Special Cases //
		if(sound === 'mettaton')
		{
			list = [];

			for(var i = 0; i < 9; i++)
				list[i] = new ig.Sound(`${this.voiceBaseURL}mettaton-${i+1}.ogg`);
		}
		else if(sound === 'temmie')
		{
			list = [];

			for(var i = 0; i < 6; i++)
				list[i] = new ig.Sound(`${this.voiceBaseURL}temmie-${i+1}.ogg`);
		}
		else if(sound === 'gaster')
		{
			list = [];

			for(var i = 0; i < 7; i++)
				list[i] = new ig.Sound(`${this.voiceBaseURL}gaster-${i+1}.ogg`);
		}

		return list || (sound ? new ig.Sound(`${this.voiceBaseURL}${sound}.ogg`) : null);
	}

	// If min = 1 & max = 10, generates 1-9.
	_getRandom(min, max) {return Math.floor(Math.random() * (max - min)) + min;}
}
