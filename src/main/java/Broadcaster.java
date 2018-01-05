import org.eclipse.jetty.websocket.api.Session;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

/**
 * sim2d
 *
 * @author Mark (Yi Han) Zhang
 * @since 2017-12-31
 */
public class Broadcaster implements Runnable{
    private static volatile ConcurrentHashMap<Session, String> onlinePlayers = Sim2D.onlinePlayers;

    @Override
    public void run() {
        while (true){
            try {
                Thread.sleep(80);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            if (!onlinePlayers.isEmpty()){
                String broadcastMessage = Sim2D.getPlayerInfo();
                for (Session session : onlinePlayers.keySet()) {
                    try {
                        session.getRemote().sendString(broadcastMessage);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }
}
