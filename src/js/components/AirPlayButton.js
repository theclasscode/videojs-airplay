'use strict';

/**
 * The AirPlayButton module contains both the AirPlayButton class definition and the
 * function used to register the button as a Video.js Component.
 *
 * @module AirPlayButton
 */

var hasAirPlayAPISupport = require('../lib/hasAirPlayAPISupport'),
    AirPlayButton;

/**
* The Video.js Button class is the base class for UI button components.
*
* @external Button
* @see {@link http://docs.videojs.com/Button.html|Button}
*/

/** @lends AirPlayButton.prototype */
AirPlayButton = {

   /**
    * This class is a button component designed to be displayed in the player UI's control
    * bar. It displays an Apple AirPlay selection list when clicked.
    *
    * @constructs
    * @extends external:Button
    */
   constructor: function(player, options) {
      this.constructor.super_.apply(this, arguments);

      if (!hasAirPlayAPISupport()) {
         this.hide();
      }

      this._reactToAirPlayAvailableEvents();

      if (options.addAirPlayLabelToButton) {
         this.el().classList.add('vjs-airplay-button-lg');

         this._labelEl = document.createElement('span');
         this._labelEl.classList.add('vjs-airplay-button-label');
         this._labelEl.textContent = this.localize('AirPlay');

         this.el().appendChild(this._labelEl);
      } else {
         this.controlText('Start AirPlay');
      }
   },

   /**
    * Overrides Button#buildCSSClass to return the classes used on the button element.
    *
    * @param {DOMElement} el
    * @see {@link http://docs.videojs.com/Button.html#buildCSSClass|Button#buildCSSClass}
    */
   buildCSSClass: function() {
      return 'vjs-airplay-button ' + this.constructor.super_.prototype.buildCSSClass();
   },

   /**
    * Overrides Button#handleClick to handle button click events. AirPlay functionality is
    * handled outside of this class, which should be limited to UI related logic. This
    * function simply triggers an event on the player.
    *
    * @fires AirPlayButton#airPlayRequested
    * @param {DOMElement} el
    * @see {@link http://docs.videojs.com/Button.html#handleClick|Button#handleClick}
    */
   handleClick: function() {
      this.player().trigger('airPlayRequested');
   },

   /**
    * Gets the underlying DOMElement used by the player.
    *
    * @private
    * @returns {DOMElement} either an <audio> or <video> tag, depending on the type of
    * player
    */
   _getMediaEl: function() {
      var playerEl = this.player().el();

      return playerEl.querySelector('video');
   },

   /**
    * Binds a listener to the `webkitplaybacktargetavailabilitychanged` event, if it is
    * supported, that will show or hide this button Component based on the availability
    * of the AirPlay function.
    *
    * @private
    */
   _reactToAirPlayAvailableEvents: function() {
      var mediaEl = this._getMediaEl(),
          self = this;

      if (!mediaEl || !hasAirPlayAPISupport()) {
         return;
      }

      function onTargetAvailabilityChanged(event) {
         if (event.availability === 'available') {
            self.show();
         } else {
            self.hide();
         }
      }

      mediaEl.addEventListener('webkitplaybacktargetavailabilitychanged', onTargetAvailabilityChanged);
      this.on('dispose', function() {
         mediaEl.removeEventListener('webkitplaybacktargetavailabilitychanged', onTargetAvailabilityChanged);
      });
   },
};

/**
 * Registers the AirPlayButton Component with Video.js. Calls
 * {@link http://docs.videojs.com/Component.html#.registerComponent}, which will add a
 * component called `airPlayButton` to the list of globally registered Video.js
 * components. The `airPlayButton` is added to the player's control bar UI automatically
 * once {@link module:enableAirPlay} has been called. If you would like to specify the
 * order of the buttons that appear in the control bar, including this button, you can do
 * so in the options that you pass to the `videojs` function when creating a player:
 *
 * ```
 * videojs('playerID', {
 *    controlBar: {
 *       children: [
 *          'playToggle',
 *          'progressControl',
 *          'volumePanel',
 *          'fullscreenToggle',
 *          'airPlayButton',
 *       ],
 *    }
 * });
 * ```
 *
 * @param videojs {object} A reference to {@link http://docs.videojs.com/module-videojs.html|Video.js}
 * @see http://docs.videojs.com/module-videojs.html#~registerPlugin
 */
module.exports = function(videojs) {
   var AirPlayButtonImpl;

   AirPlayButtonImpl = videojs.extend(videojs.getComponent('Button'), AirPlayButton);
   videojs.registerComponent('airPlayButton', AirPlayButtonImpl);
};
