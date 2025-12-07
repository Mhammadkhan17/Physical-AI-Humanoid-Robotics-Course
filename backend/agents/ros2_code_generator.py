from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal

router = APIRouter()

class Ros2CodeRequest(BaseModel):
    prompt: str
    code_type: Literal["node", "launch_file", "urdf"]

@router.post("/generate_ros2_code")
async def generate_ros2_code(request: Ros2CodeRequest):
    # Placeholder for actual ROS2 code generation logic
    generated_code = f"# Generated ROS2 {request.code_type} based on: {request.prompt}\n" \
                     f"# This is a placeholder. Implement actual code generation here."

    if request.code_type == "node":
        generated_code += "\nimport rclpy\nfrom rclpy.node import Node\n\nclass MinimalPublisher(Node):\n    def __init__(self):\n        super().__init__('minimal_publisher')\n        self.publisher_ = self.create_publisher(String, 'topic', 10)\n        timer_period = 0.5  # seconds\n        self.timer = self.create_timer(timer_period, self.timer_callback)\n        self.i = 0\n\n    def timer_callback(self):\n        msg = String()\n        msg.data = 'Hello: %d' % self.i\n        self.publisher_.publish(msg)\n        self.get_logger().info('Publishing: \"%s\"' % msg.data)\n        self.i += 1\n\ndef main(args=None):\n    rclpy.init(args=args)\n\n    minimal_publisher = MinimalPublisher()\n\n    rclpy.spin(minimal_publisher)\n\n    minimal_publisher.destroy_node()\n    rclpy.shutdown()\n\nif __name__ == '__main__':\n    main()"
    elif request.code_type == "launch_file":
        generated_code += "\nfrom launch import LaunchDescription\nfrom launch_ros.actions import Node\n\ndef generate_launch_description():\n    return LaunchDescription([\n        Node(\n            package='my_package',\n            executable='my_node',\n            name='my_node_name',\n            output='screen'\n        ),\n    ])"
    elif request.code_type == "urdf":
        generated_code += "\n<?xml version=\"1.0\"?>\n<robot name=\"my_robot\">\n  <link name=\"base_link\">\n    <visual>\n      <geometry>\n        <box size=\"0.1 0.1 0.1\"/>\n      </geometry>\n    </visual>\n  </link>\n  <joint name=\"fixed_joint\" type=\"fixed\">\n    <parent link=\"base_link\"/>\n    <child link=\"link_1\"/>\n    <origin xyz=\"0 0 0.1\"/>\n  </joint>\n  <link name=\"link_1\">\n    <visual>\n      <geometry>\n        <cylinder radius=\"0.05\" length=\"0.1\"/>\n      </geometry>\n    </visual>\n  </link>\n</robot>"

    return {"generated_code": generated_code}