package fr.xebia.werewolf

import android.content.Context
import android.content.SharedPreferences
import fr.xebia.werewolf.Constants.Companion.GAME_ID
import fr.xebia.werewolf.Constants.Companion.PLAYER_NAME

class PrefsUtil(context: Context) {

    val PREFS_FILENAME = "fr.xebia.werewovles"
    val prefs: SharedPreferences = context.getSharedPreferences(PREFS_FILENAME, 0)

    var currentGameId: String
        get() = prefs.getString(GAME_ID, "")
        set(value) = prefs.edit().putString(GAME_ID, value).apply()

    var currentPlayerName: String
        get() = prefs.getString(PLAYER_NAME, "")
        set(value) = prefs.edit().putString(PLAYER_NAME, value).apply()
}