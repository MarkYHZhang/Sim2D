/**
 * sim2d
 *
 * @author Mark (Yi Han) Zhang
 * @since 2017-12-31
 */
public class Player {

    private String username, password, message="!null!";
    private int x, y, direction, type; //direction: 0,1,2,3 -> up right down left
    private long messageExpireTime;

    public Player(String username, String password, int x, int y, int type){
        this.username = username;
        this.password = password;
        this.x = x;
        this.y = y;
        this.type = type;
    }

    public String getMessage() {
        String tmp = message;
        message = "";
        return tmp;
    }

    public long getMessageExpireTime() {
        return messageExpireTime;
    }

    public int getType() {
        return type;
    }

    public String getUsername() {
        return username;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public int getDirection() {
        return direction;
    }

    public String getPassword() {
        return password;
    }

    public void sync(int x, int y, int direction, String message, long messageExpireTime){
        this.x = x;
        this.y = y;
        this.message = message;
        this.messageExpireTime = messageExpireTime;
    }
}
