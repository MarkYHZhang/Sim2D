import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;

import java.io.IOException;

/**
 * sim2d
 *
 * @author Mark (Yi Han) Zhang
 * @since 2017-12-31
 */

@WebSocket
public class ClientHandler {

    @OnWebSocketConnect
    public void onConnect(Session user) throws Exception {
        System.out.println("Connected! " + user.getRemoteAddress());
    }

    @OnWebSocketClose
    public void onClose(Session user, int statusCode, String id) {
        System.out.println("Disconnected! " + user.getRemoteAddress());
        Sim2D.onlinePlayers.remove(user);
    }

    @OnWebSocketMessage
    public void onMessage(Session user, String message) {
        if (message.startsWith("/login")){
            try {
                String[] args = message.split(" ");
                String username = args[1];
                String password = args[2];
                if (Sim2D.players.containsKey(username)&&Sim2D.players.get(username).getPassword().equals(password)) {
                    user.getRemote().sendString("ConnectionSuccess " + username + " " + Sim2D.players.get(username).getX() + " " + Sim2D.players.get(username).getY());
                    Sim2D.onlinePlayers.put(user, username);
                }else
                    user.getRemote().sendString("ConnectionFailure");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }else if(message.startsWith("/register")){//TODO add this feature when you have time!!!

        }else{
            System.out.println(message);
            String[] data = message.split(" ");
            String name = data[0];
            int x = Integer.parseInt(data[1]);
            int y = Integer.parseInt(data[2]);
            int direction = Integer.parseInt(data[3]);
            String speech = data[4];
            long messageExpireTime = Long.parseLong(data[5]);

            if (Sim2D.players.containsKey(name))
                Sim2D.players.get(name).sync(x,y,direction,speech,messageExpireTime);
        }
    }
}
