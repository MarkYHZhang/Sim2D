import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import org.eclipse.jetty.websocket.api.Session;
import spark.Spark;

import java.util.concurrent.ConcurrentHashMap;

import static spark.Spark.get;
import static spark.Spark.init;
import static spark.Spark.port;
import static spark.Spark.staticFileLocation;
import static spark.Spark.webSocket;

/**
 * sim2d
 *
 * @author Mark (Yi Han) Zhang
 * @since 2017-12-31
 */
public class Sim2D {

    static volatile ConcurrentHashMap<String, Player> players = new ConcurrentHashMap<>();
    static volatile ConcurrentHashMap<Session, String> onlinePlayers = new ConcurrentHashMap<>();

    public static void main(String[] args) {
        port(80);
        staticFileLocation("/public");

        players.put("mark", new Player("mark","welcome",3,1, 0));
        players.put("bob", new Player("bob","welcome",3,2, 0));

        Spark.exception(Exception.class, (exception, request, response) -> {
            exception.printStackTrace();
        });

        GameMap gameMap = new GameMap(20,20);

        webSocket("/socket", ClientHandler.class);
        init();
        get("/rawMap", (req, res) -> GameMap.getDebugMap());

        new Sim2D().run();
    }

    private void run(){
        Thread thread = new Thread(new Broadcaster());
        thread.start();
    }

    public static String getPlayerInfo(){
        JsonObject jsonData = new JsonObject();
        JsonArray jsonArray = new JsonArray(players.size());
        for (String name : onlinePlayers.values()){
            JsonObject playerJson = new JsonObject();
            Player player = players.get(name);
            playerJson.add("username", new JsonPrimitive(player.getUsername()));
            playerJson.add("type", new JsonPrimitive(player.getType()));
            playerJson.add("x", new JsonPrimitive(player.getX()));
            playerJson.add("y", new JsonPrimitive(player.getY()));
            playerJson.add("direction", new JsonPrimitive(player.getDirection()));
            playerJson.add("message", new JsonPrimitive(player.getMessage()));
            playerJson.add("messageExpireTime", new JsonPrimitive(player.getMessageExpireTime()));
            jsonArray.add(playerJson);
        }
        jsonData.add("serverTime", new JsonPrimitive(System.currentTimeMillis()));
        jsonData.add("players", jsonArray);
        System.out.println(gson.toJson(jsonData));
        return gson.toJson(jsonData);
    }

    static Gson gson = new Gson();
}
