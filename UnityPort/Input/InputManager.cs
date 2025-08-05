using UnityEngine;

public class InputManager : MonoBehaviour
{
    public PlayerController player;
    private float lastTapTime = 0f;
    private const float doubleTapThreshold = 0.3f;
    public System.Action OnDoubleTap;

    void Update()
    {
        if (player == null) return;

        // mouse input
        if (Input.GetMouseButton(0))
        {
            Vector3 pos = Input.mousePosition;
            pos.z = Mathf.Abs(Camera.main.transform.position.z);
            Vector3 world = Camera.main.ScreenToWorldPoint(pos);
            player.MoveTo(new Vector3(world.x, world.y, 0f));
        }

        // touch input
        if (Input.touchCount > 0)
        {
            Touch touch = Input.GetTouch(0);
            Vector3 pos = new Vector3(touch.position.x, touch.position.y, Mathf.Abs(Camera.main.transform.position.z));
            Vector3 world = Camera.main.ScreenToWorldPoint(pos);
            player.MoveTo(new Vector3(world.x, world.y, 0f));

            if (touch.phase == TouchPhase.Ended)
            {
                if (Time.time - lastTapTime < doubleTapThreshold)
                {
                    OnDoubleTap?.Invoke();
                }
                lastTapTime = Time.time;
            }
        }
    }
}

