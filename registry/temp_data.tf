data "aws_instances" "orphan" {
  filter {
    name   = "instance.group-id"
    values = ["sg-03553d9044f8eb3f5"]
  }
}
