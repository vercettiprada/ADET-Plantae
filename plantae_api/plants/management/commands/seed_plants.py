from django.core.management.base import BaseCommand
from plants.models import Plant

class Command(BaseCommand):
    help = 'Seed the database with all 11 plants from plant.js'

    def handle(self, *args, **options):
        plants = [
            {'id':1,'name':'Monstera Deliciosa','species':'Swiss Cheese Plant','image_url':'https://thumbs.dreamstime.com/b/monstera-plant-white-pot-large-has-long-green-leaves-background-304063612.jpg','secret_fact':'Named for its delicious fruit, which tastes like pineapple and banana.','light':'Bright, Indirect','water':'Every 7-10 days'},
            {'id':2,'name':'Snake Plant','species':'Dracaena trifasciata','image_url':'https://inaturalist-open-data.s3.amazonaws.com/photos/122129468/original.jpg','secret_fact':'Can survive in low light and with infrequent watering.','light':'Low to Bright','water':'Every 2-3 weeks'},
            {'id':3,'name':'Fiddle Leaf Fig','species':'Ficus lyrata','image_url':'https://media.istockphoto.com/id/1393839291/photo/green-leaves-tropical-houseplant-fiddle-leaf-fig-tree-in-small-ceramic-pot-ornamental-tree.jpg','secret_fact':'Does not produce edible fruit despite its name.','light':'Bright, Indirect','water':'Every 7-10 days'},
            {'id':4,'name':'Night Blooming Cereus','species':'Epiphyllum oxypetalum','image_url':'https://upload.wikimedia.org/wikipedia/commons/6/6e/Epiphyllum_oxypetalum_flower.JPG','secret_fact':'Blooms only at night and the flowers last for just one night.','light':'Bright, Indirect','water':'Every 7-10 days'},
            {'id':5,'name':'Venus Flytrap','species':'Dionaea muscipula','image_url':'https://cdn.mos.cms.futurecdn.net/6HAm6NiJBhJmuU6PFDaYJ6.jpg','secret_fact':'Carnivorous plant that traps and digests insects.','light':'Bright, Direct','water':'Keep soil moist'},
            {'id':6,'name':'Lavender','species':'Lavandula angustifolia','image_url':'https://mullerseeds.com/app/uploads/2021/04/50914-1-Lavandula-Blue-ScentEarly-2-773x1024.jpg','secret_fact':'Has calming properties and can be used in aromatherapy.','light':'Full Sun','water':'Every 1-2 weeks'},
            {'id':7,'name':'Aloe Vera','species':'Aloe barbadensis miller','image_url':'https://www.cactusoutlet.com/cdn/shop/files/Aloeverabackground1_2048x.png','secret_fact':'Gel can be used to soothe burns and skin irritations.','light':'Bright, Indirect','water':'Every 3 weeks'},
            {'id':8,'name':'Peace Lily','species':'Spathiphyllum','image_url':'https://cdn11.bigcommerce.com/s-fr32feerow/product_images/uploaded_images/peace-lily-01.jpg','secret_fact':'Helps improve indoor air quality by filtering out toxins.','light':'Low to Bright','water':'Every 1-2 weeks'},
            {'id':9,'name':'Jade Plant','species':'Crassula ovata','image_url':'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhQ7LySYHwGvoS571Tp-lRlUX8iWKxjHO-uFGd48ktk8hhA7ydlJuBtN5bhPGlMzn6wRNDxjm7cMAY4denn5ZCPBVl9wAqWtJfHAFPUfQypv5Ub8zj0HLtJOpsAHhtJz9MN07K4jUgyRWw/s1600/DSC04049.jpg','secret_fact':'Symbol of good luck and prosperity in many cultures.','light':'Bright, Indirect','water':'Every 2-3 weeks'},
            {'id':10,'name':'Spider Plant','species':'Chlorophytum comosum','image_url':'https://stacyling.com/wp-content/uploads/2024/10/spider-plant-3.jpg','secret_fact':'Produces babies or offshoots that can be propagated.','light':'Bright, Indirect','water':'Every 1-2 weeks'},
            {'id':11,'name':'Boston Fern','species':'Nephrolepis exaltata','image_url':'https://costafarms.com/cdn/shop/files/L-BOS-P-WMC-01-CF--white_411c64f6-cb73-419c-8204-eb2154c19b62_2048x2048.jpg','secret_fact':'Known for air-purifying qualities.','light':'Indirect, Filtered','water':'Keep soil consistently moist'},
        ]
        for p in plants:
            Plant.objects.get_or_create(id=p['id'], defaults=p)
        self.stdout.write(self.style.SUCCESS(f'Seeded {Plant.objects.count()} plants!'))