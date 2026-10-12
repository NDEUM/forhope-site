import { Journey } from "@/components/journey/Journey";
import { HomeSections } from "@/components/home/HomeSections";
import { PhotoArc } from "@/components/home/PhotoArc";
import { Outro } from "@/components/journey/Outro";
import { Preloader } from "@/components/ui/Preloader";
import "./home.css";

/**
 * Homepage : le voyage (espace → Afrique → Sénégal → For Hope), puis le
 * récit éditorial de l'association.
 */
export default function HomePage() {
  return (
    <div className="home2">
      <Journey />
      <PhotoArc />
      <HomeSections />
      <Outro />
      <Preloader />
    </div>
  );
}
