package ;

import android.app.Activity;
import android.os.Bundle;
import com.phonegap.*;

public class  extends DroidGap
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        super.init();

        KeyBoard keyboard = new KeyBoard(this, appView);
        appView.addJavascriptInterface(keyboard, "KeyBoard");
        super.loadUrl("file:///android_asset/www/index.html");

    }
}

